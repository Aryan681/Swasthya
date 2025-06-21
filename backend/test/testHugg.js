async function testTranslation() {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/facebook/nllb-200-distilled-600M",
      {
        headers: {
          Authorization: `Bearer ${process.env.HF_TOKEN}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({ inputs: "mwen gen lafyèv" }),
      }
    );
    const result = await response.json();
    console.log(result);
  }
  
  testTranslation();