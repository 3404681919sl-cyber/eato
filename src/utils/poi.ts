// ─── Gaode JSONP (绕过浏览器 CORS) ───
export const gaodeJSONP = (url: string): Promise<any> =>
  new Promise((resolve, reject) => {
    const cbName = "gaode_cb_" + Date.now() + "_" + Math.floor(Math.random() * 9999);
    const script = document.createElement("script");
    const cleanup = () => {
      delete (window as any)[cbName];
      if (script.parentNode) script.parentNode.removeChild(script);
    };
    (window as any)[cbName] = (data: any) => { cleanup(); resolve(data); };
    script.onerror = () => { cleanup(); reject(new Error("jsonp error")); };
    script.src = url + (url.includes("?") ? "&" : "?") + "callback=" + cbName;
    document.body.appendChild(script);
    setTimeout(() => { cleanup(); reject(new Error("timeout")); }, 8000);
  });
