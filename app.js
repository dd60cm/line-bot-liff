const CONFIG = {

    LIFF_ID: "2010505293-f0f3W4oz",

    GAS_URL: "https://script.google.com/macros/s/AKfycbzRX8ikWuQ6Bd1aUC4k9NLHzT0gAHTWKlAqZ3A5Y3oteMPhLRJ1GVg-taKkTWoF5xgw1w/exec"

};

// カレンダー・コールバック関数

async function loadEvents(info, successCallback, failureCallback) {

    try {
	    const auth = await authenticate();
        const events = await getEvents(
            info.startStr,
            info.endStr,
            auth
        );

/* ダミーデータ const events = [

  { title: 'A', start: '2026-08-01' },

  { title: 'B', start: '2026-08-02' },

  { title: 'C', start: '2026-08-03' },

  { title: 'C', start: '2026-08-04' },

  { title: 'A', start: '2026-08-05' },

  { title: 'B', start: '2026-08-06' },

  { title: 'C', start: '2026-08-07' },

  { title: 'C', start: '2026-08-08' },

  { title: 'B', start: '2026-08-09' },

  { title: 'C', start: '2026-08-10' },

  { title: 'C', start: '2026-08-11' },

  { title: 'C', start: '2026-08-12' }

];*/
        successCallback(events);

    } catch (e) {

        console.error('loadEvents:', e);
    }
}

async function getEvents(start, end, auth = {}) {

    const payload ={

        ...auth,
        
        start,
        
        end
    };
    
    const result = await post("GET_EVENTS", payload);
    
    if (!result.success) {
        
        alert(result.message);
        
        return [];
    }
    
    return result.events;
}

// 認証処理

async function authenticate() {

    const sessionToken = sessionStorage.getItem("sessionToken");

    if (sessionToken) {

        return {
            sessionToken
        };
    }

    const accessToken = await getAccessToken();

    const result = await post("AUTH", {
        accessToken
    });

    sessionStorage.setItem(
        "sessionToken",
        result.sessionToken
    );

    return {
        sessionToken: result.sessionToken
    };
}

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

// テスト用・データ取得と反映のための別関数
async function loadAndReflectEvents(calendar) {
    try {
        const auth = await authenticate();
        const result = await getEvents('2026-06-01', '2026-09-01', auth);
        
        calendar.addEventSource(result);
    
    } catch (error) {
        console.error('後読み込みデータの設定に失敗しました:', error);
    }
}

// メイン処理

async function main() {

  try {

        // const auth = await authenticate();

        // const result = await getEvents('2026-07-01', '2026-08-01', auth);
        
        
            
        const calendarEl = document.getElementById('calendar');
            
        /* events コールバック方式
        const calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: 'dayGridMonth',
            locale: 'ja',
            events: loadEvents
        });*/
        
        // 1. 先に空っぽのカレンダーを描画しておく
        const calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: 'dayGridMonth',
            locale: 'ja'
        });
        calendar.render();
        
        // 2. データを非同期で取得して後から追加する関数を実行
        loadAndReflectEvents(calendar);

    
    // document.getElementById("result").textContent = JSON.stringify(result);


  } catch(err) {

    console.log(err);

    document.getElementById("calendar").textContent = JSON.stringify(err);
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

