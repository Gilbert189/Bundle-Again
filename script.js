document.addEventListener("build", function(e) {
    console.log("ok")
    const editor = document.getElementById("editor");
    const output = document.getElementById("output");
    const runButton = document.getElementById("run-button");
    const clearButton = document.getElementById("clear-button");
    const stopButton = document.getElementById("stop-button");
    const resetButton = document.getElementById("reset-button");
    
    function escape(text) {
        console.log(text);
        return text.replaceAll("&", "&amp")
                   .replaceAll("<", "&lt")
                   .replaceAll(">", "&gt");
    }
    
    /* Make interpreter */
    let interpreter = Object.create(BundleAgain);
    async function init() {
        /* Make sure the interpreter has stopped before we reset */
        interpreter.stop = true;
        await interpreter.exec("", true);
        interpreter.vars = Object.create(null);
        interpreter.loop = false;
        interpreter.stop = false;
        interpreter.delay = 100;
        interpreter.nextIter = null;
        interpreter.clear();
    }
    interpreter.write = function(text) {
        output.innerHTML += String(text);
    }
    interpreter.error = function(text, line) {
        output.innerHTML += `<span style="color: red; font-weight: 600;">[L:${line}] ${escape(String(text))}</span>`;
    }
    interpreter.clear = function() {
        output.innerHTML = "";
    }
    
    
    /* Add events */
    runButton.addEventListener("click", () => {interpreter.exec(editor.value);});
    clearButton.addEventListener("click", () => {interpreter.clear();});
    stopButton.addEventListener("click", () => {interpreter.stop = true; interpreter.loop = false;});
    resetButton.addEventListener("click", () => {if(confirm("Are you sure you want to reset Bundle?"))init()});
});