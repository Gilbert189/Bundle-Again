// A simple utility to interpolate templates.
// ... while also butchering every single HTML writing styles.
const buildEvent = new Event("build");

const FillerUp = {
    load(elmt) {
        try {
            console.log("Interpolating document...");
            FillerUp.fill(document.body)
                .then(_ => {document.dispatchEvent(buildEvent)});
        } catch (e) {
            document.body.innerText = `An error occured while interpolating: {e}`;
            throw e;
        }
    },
    
    async fill(body, fname=undefined) {
        // Copy the template node
        body = document.importNode(body, true);
        // Clear this document
        document.open();
        
        // Iterate over the body
        for (let elm of [...body.childNodes]) {
            switch (elm.tagName) {
                case "USE": // Use a custom template
                    if (fname == elm.getAttribute("template")) {
                        throw InternalError("potential recursion detected");
                    }
                    
                    let received = "";
                    let append = elm.getAttribute("append") ?? false;
                    received = await fetch(elm.getAttribute("template"), {  // get this template
                        cache: "force-cache"
                    }).then(x => x.text());
                    received = new DOMParser().parseFromString(received, "text/html");

                    if (append) {
                        document.body.appendChild(received.body);
                    } else {
                        document.querySelector("html").innerHTML = received.querySelector("html").innerHTML;
                    }
                break;
                case "FILL": // Fill a placeholder
                    for (let e of document.querySelector("html").getElementsByClassName(elm.id)) {
                        if (e.tagName == "PLACEHOLDER") e.replaceWith(...elm.childNodes);
                    }
                case "SCRIPT":
                break;
                default:
                    document.body.appendChild(elm);
                break;
            }
        }
    }
};

document.addEventListener("build", () => console.log("build event called"));