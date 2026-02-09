// ---------- Home Page Scripts ----------
export const initHomePageScripts = () => {
    // Google Tag Manager script (head)
    const gtmScript = document.createElement("script");
    gtmScript.innerHTML = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','GTM-KX7CG3BN');`;
    document.head.appendChild(gtmScript);

    // Google Tag Manager noscript (body)
    const gtmNoscript = document.createElement("noscript");
    const gtmIframe = document.createElement("iframe");
    gtmIframe.src = "https://www.googletagmanager.com/ns.html?id=GTM-KX7CG3BN";
    gtmIframe.height = "0";
    gtmIframe.width = "0";
    gtmIframe.style.display = "none";
    gtmIframe.style.visibility = "hidden";
    gtmNoscript.appendChild(gtmIframe);
    document.body.appendChild(gtmNoscript);

    return () => {
        if (document.head.contains(gtmScript)) {
            document.head.removeChild(gtmScript);
        }
        if (document.body.contains(gtmNoscript)) {
            document.body.removeChild(gtmNoscript);
        }
    };
};


// ---------- Thank You Page Scripts ----------
export const initThankYouPageScripts = () => {
};
