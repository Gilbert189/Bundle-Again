/* This is the interpreter of Bundle Again. */

const BundleAgain = {
    vars: Object.create(null), // No JavaScript cheese
    loop: false,
    running: false,

    log(text) {
        console.log(text);
    },
    
    prompt(text) {
        return prompt(text);
    },
    
    exec(code) {
        let lines = code.split("\n");
        
        for (let line of lines) {
            let [command, input] = line.split(/ (.*)/s);
            switch (command) {
                case 
            }
        }
    },
}