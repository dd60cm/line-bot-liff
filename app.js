const CONFIG = {

    LIFF_ID: "2010505293-f0f3W4oz",

    GAS_URL: "https://script.google.com/macros/s/AKfycbzRX8ikWuQ6Bd1aUC4k9NLHzT0gAHTWKlAqZ3A5Y3oteMPhLRJ1GVg-taKkTWoF5xgw1w/exec"

};

// アクセストークンの取得

async function getAccessToken() {

    if (typeof getDevAccessToken === "function") {

        console.log("開発者モード");

        return getDevAccessToken();
    }

    console.log("LIFFモード");

    try {

        await liff.init({

            liffId: CONFIG.LIFF_ID
        });

        return liff.getAccessToken();

    } catch (error) {

        throw {

            type: "LIFF_ERROR",

            code: error.code,

            message: error.message,

            cause: error.cause
        };
    }
}

// GASに送信

async function post(action, body = {} ) {

    try {

        const payload = {

            ...body,

            action
        };
        console.log(payload);

        const res = await fetch(CONFIG.GAS_URL, {

            method: "POST",

            headers: {
                "Content-Type": "text/plain" // "application/json" プリフライトリクエストを回避
            },

            body: JSON.stringify(payload)
        });
        console.log("Response:", res);

        console.log("status:", res.status);

        console.log("ok:", res.ok);

        if (!res.ok) {

            throw {
                type: "HTTP_ERROR",
                code: res.status,
                message: res.statusText
            };
        }

        return await res.json();

    } catch(error) {

        if (error.type) {

            throw error;
        }

        throw {

            type: "NETWORK_ERROR",

            message: error.message
        };
    }
}

// メイン処理

async function main() {

  try {

        const accessToken = await getAccessToken();

        const result =

            await post("count", { accessToken });
    
    document.getElementById("result").textContent = JSON.stringify(result);


  } catch(err) {

    console.log(err);

    document.getElementById("result").textContent = JSON.stringify(err);
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

