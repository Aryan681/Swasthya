class OfflineManager {
  static STORAGE_KEY = 'symptom_submissions';
  static MAX_STORAGE_ITEMS = 50;
  static MAX_RETRIES = 3;
  listeners = [];
  retryTimeout = null;
  retryDelay = 1000;
  retryCount = 0;

  constructor() {
    window.addEventListener('online', this.handleStatusChange);
    window.addEventListener('offline', this.handleStatusChange);
  }

  onStatusChange(listener) {
    this.listeners.push(listener);
    return () => this.offStatusChange(listener);
  }

  offStatusChange(listener) {
    this.listeners = this.listeners.filter(fn => fn !== listener);
  }

  handleStatusChange = () => {
    const isOnline = navigator.onLine;
    this.listeners.forEach(fn => fn(isOnline));
    if (isOnline) {
      this.promptSyncIfNeeded();
    }
  };

  validateSubmission(data) {
    return data && 
           data.symptoms && 
           typeof data.symptoms === 'string' && 
           data.symptoms.trim().length > 0;
  }

  isOnline() {
    return navigator.onLine;
  }

  getPendingSubmissions() {
    try {
      const data = localStorage.getItem(OfflineManager.STORAGE_KEY);
      if (!data) return [];
      
      const submissions = JSON.parse(data);
      
      // Migrate old string format to object format
      return submissions.map(sub => {
        if (typeof sub === 'string') {
          return {
            id: Date.now(),
            symptoms: sub,
            language: 'en',
            timestamp: new Date().toISOString(),
            status: 'pending'
          };
        }
        return sub;
      });
    } catch {
      return [];
    }
  }

  saveSubmission(data) {
    if (!this.validateSubmission(data)) {
      throw new Error('Submission must contain non-empty symptoms string');
    }

    const submissions = this.getPendingSubmissions();
    if (submissions.length >= OfflineManager.MAX_STORAGE_ITEMS) {
      submissions.shift(); // Remove oldest
    }

    const submission = {
      id: Date.now(),
      symptoms: data.symptoms.trim(),
      language: data.language || 'en',
      timestamp: new Date().toISOString(),
      status: 'pending'
    };

    submissions.push(submission);
    localStorage.setItem(OfflineManager.STORAGE_KEY, JSON.stringify(submissions));
    
    return submission;
  }

  async syncSubmissions(apiUrl) {
    const submissions = this.getPendingSubmissions();
    const pending = submissions.filter(s => s.status === 'pending');
    if (pending.length === 0) return { synced: 0, failed: 0, results: [] };

    let synced = 0, failed = 0;
    const results = [];
    for (const sub of pending) {
      try {
        const res = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(sub)
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        sub.status = 'synced';
        synced++;
        results.push({ id: sub.id, data });
        this.retryDelay = 1000; // reset on success
      } catch (err) {
        sub.status = 'failed';
        sub.error = err.message;
        failed++;
        results.push({ id: sub.id, error: err.message });
        if (this.retryTimeout === null) {
          this.retryTimeout = window.setTimeout(() => {
            this.retryTimeout = null;
            this.syncSubmissions(apiUrl);
          }, this.retryDelay);
          this.retryDelay = Math.min(this.retryDelay * 2, 60000); // max 1 min
        }
      }
    }
    localStorage.setItem(OfflineManager.STORAGE_KEY, JSON.stringify(submissions));
    return { synced, failed, results };
  }

  async tryBatchSubmission(apiUrl, pending) {
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          batch: pending.map(sub => this.formatSubmissionForBackend(sub))
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      pending.forEach(sub => {
        sub.status = 'synced';
      });
      
      return { synced: pending.length, failed: 0 };
    } catch (error) {
      return { 
        synced: 0, 
        failed: pending.length,
        error 
      };
    }
  }

  async tryIndividualSubmissions(apiUrl, pending) {
    let synced = 0;
    let failed = 0;
    let lastError = null;

    for (const sub of pending) {
      try {
        const submissionData = this.formatSubmissionForBackend(sub);
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(submissionData)
        });

        if (!response.ok) {
          const error = await this.parseErrorResponse(response);
          throw new Error(error.message || `HTTP ${response.status}`);
        }

        sub.status = 'synced';
        synced++;
      } catch (error) {
        sub.status = error.message.includes('400') ? 'invalid' : 'failed';
        sub.error = error.message;
        failed++;
        lastError = error;
      }
    }

    return { synced, failed, error: lastError };
  }

  formatSubmissionForBackend(submission) {
    return {
      symptoms: submission.symptoms.trim(),
      language: submission.language || 'en'
    };
  }

  async parseErrorResponse(response) {
    try {
      const errorData = await response.json();
      return {
        message: errorData.error || `HTTP ${response.status}`,
        details: errorData.details
      };
    } catch {
      return {
        message: `HTTP ${response.status}`
      };
    }
  }

  scheduleRetry(apiUrl) {
    if (this.retryTimeout) clearTimeout(this.retryTimeout);

    this.retryCount++;
    this.retryDelay = Math.min(this.retryDelay * 2, 30000); // Max 30s delay

    if (this.retryCount < OfflineManager.MAX_RETRIES) {
      this.retryTimeout = setTimeout(() => {
        this.retryTimeout = null;
        this.syncSubmissions(apiUrl);
      }, this.retryDelay);
    } else {
      this.resetRetryState();
    }
  }

  resetRetryState() {
    this.retryCount = 0;
    this.retryDelay = 1000;
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
      this.retryTimeout = null;
    }
  }

  removeSynced() {
    const submissions = this.getPendingSubmissions();
    const filtered = submissions.filter(s => s.status !== 'synced');
    localStorage.setItem(OfflineManager.STORAGE_KEY, JSON.stringify(filtered));
  }

  promptSyncIfNeeded() {
    const pending = this.getPendingSubmissions().filter(s => s.status === 'pending');
    if (pending.length > 0 && this.isOnline()) {
      console.log('[OfflineManager] Pending submissions found');
    }
  }
}

const offlineManager = new OfflineManager();
export default offlineManager;