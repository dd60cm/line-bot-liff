async function main() {

  try {

    let accessToken;

    if(typeof getAccessToken === "function") {

        console.log('開発者モード');

        accessToken = getAccessToken();

    } else {

        console.log('LIFFモード');

        await liff.init({

            liffId: '2010505293-f0f3W4oz'
        });

        accessToken = liff.getAccessToken();
    }

    const res = await fetch('https://script.google.com/macros/s/AKfycbzRX8ikWuQ6Bd1aUC4k9NLHzT0gAHTWKlAqZ3A5Y3oteMPhLRJ1GVg-taKkTWoF5xgw1w/exec', {

      method: "POST",

      headers: {

        "Content-Type": "text/plain" // "application/json" プリフライトリクエストを回避

      },

      body: JSON.stringify({

        action: "count",

        accessToken: accessToken

      })
    });
    
    const data = await res.text();
    
    document.getElementById("result").textContent = data;


  } catch(err) {

    console.error(err);

    document.getElementById("result").textContent =

    JSON.stringify({

      name: err.name,

      message: err.message,

      stack: err.stack

    }, null, 2);
  }
}

if (!liff.isInClient()) {

  const script = document.createElement("script");

  script.src = "dev.js";

  script.onload = main;

  script.onerror = () => {

    document.body.textContent =

      "開発環境ではありません。";

  };

  document.head.appendChild(script);  


} else {

  main();

}

