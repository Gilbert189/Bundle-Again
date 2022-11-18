/* This is the interpreter of Bundle Again. */

const BundleAgain = {
    vars: Object.create(null), // No JavaScript cheese
    loop: false,
    stop: false,
    delay: 100,
    nextIter: null,

    write(text) {
        console.log(text);
    },

    error(text, line) {
        console.error(`[L:${line}]`, text);
    },
    
    ask(text) {
        return prompt(text);
    },

    clear() {
        console.clear();
    },
    
    async exec(code, looping=false) {
        /* check if exec has been called */
        if (this.nextIter !== null && !looping) return;
        else if (!looping) this.loop = false;
        
        let command, input;
        const replace = function(i) {
            for (let name in this.vars) {
                i = i.replaceAll(`{${name}}`, this.vars[name]);
            }
            return i;
        }.bind(this);
        const assert = (truth, reason="Assertion failed") => {if (!truth) throw Error(reason)};
        const assertEmpty = (reason="Incorrect input") => assert(!input?.length, reason);
        const assertGreater = (num, reason="Incorrect input") => assert(input?.length > num, reason);
        
        let lines = code.split("\n");
        let index = 1;
        let skip = false;

        try {
            if (lines[0] == "start") {
                if (lines[lines.length - 1] == "end") {
                    lines = lines.slice(1, -1);
                } else {
                    throw Error("bad end");
                }
            }
            for (let line of lines) {
                if (skip) {
                    skip = false;
                    continue;
                }
                [command, input] = line.split(/ (.*)/s);
                switch (command) {
                    case "//":
                    case "#":
                    case "":
                        break;
                    case "def":
                        assertGreater(0);
                        [name, value] = input.split(/=(.*)/s);
                        this.vars[name] = replace(value);
                        break;
                    case "arr":
                        assertGreater(0);
                        [name, value] = input.split(/=(.*)/s);
                        this.vars[name] = value.split(",").map(replace);
                        break;
                    case "getarr":
                        assertGreater(0);
                        [name, i] = input.split(/,(.*)/s);
                        i = parseInt(i);
                        assert(this.vars[name].constructor === Array, `variable ${name} is not an array`);
                        this.vars.res = this.vars[name][i];
                        break;
                    case "concat":
                        assertGreater(0);
                        vars = input.split(",");
                        vars.forEach((name) => assert(this.vars[name] === Array, `variable ${name} is not an array`));
                        this.vars.res = vars.reduce((xs, x) => xs.concat(this.vars[x]), []);
                        break;
                    case "write":
                        assertGreater(0);
                        this.write(replace(input));
                        break;
                    case "writeln":
                        assertGreater(0);
                        this.write(replace(input) + "<br>");
                        break;
                    case "wait":
                        assertGreater(0);
                        await new Promise(r => setTimeout(r, parseFloat(replace(input)) * 1000));
                        break;
                    case "break":
                        assertEmpty();
                        this.write("<br>");
                        break;
                    case "throw":
                        assertGreater(0);
                        this.write(this.vars[input]);
                        break;
                    case "ask":
                        this.vars.res = this.ask(input);
                        break;
                    case "length":
                        assertGreater(0);
                        this.vars.res = this.vars[input].length;
                        break;
                    case "date":
                        assertEmpty();
                        this.vars.res = new Date().getDate();
                        break;
                    case "month":
                        assertEmpty();
                        this.vars.res = new Date().getMonth();
                        break;
                    case "year":
                        assertEmpty();
                        this.vars.res = new Date().getFullYear();
                        break;
                    case "hour":
                        assertEmpty();
                        this.vars.res = new Date().getHour();
                        break;
                    case "minute":
                        assertEmpty();
                        this.vars.res = new Date().getMinute();
                        break;
                    case "second":
                        assertEmpty();
                        this.vars.res = new Date().getSecond();
                        break;
                    case "clear":
                        assertEmpty();
                        this.clear();
                        break;
                    case "random":
                        assertGreater(0);
                        [low, high] = input.split(/,(.*)/s);
                        this.vars.res = String(Math.round(Math.random() * (parseInt(replace(high)) - parseInt(replace(low)) + 1) + parseInt(replace(low))));
                        break;
                    case "add": 
                        assertGreater(0);
                        this.vars.res = input.split(",")
                                        	 .map(x => parseFloat(replace(x)))
                                        	 .reduce((xs, x) => xs + x, 0);
                        this.vars.res = String(this.vars.res);
                        break;
                    case "sub": 
                        assertGreater(0);
                        this.vars.res = input.split(",")
                                        	 .map(x => parseFloat(replace(x)))
                                             .reverse()
                                        	 .reduce((xs, x) => x - xs, 0);
                        this.vars.res = String(this.vars.res);
                        break;
                    case "mul": 
                        assertGreater(0);
                        this.vars.res = input.split(",")
                                        	 .map(x => parseFloat(replace(x)))
                                        	 .reduce((xs, x) => xs * x, 1);
                        this.vars.res = String(this.vars.res);
                        break;
                    case "div": 
                        assertGreater(0);
                        this.vars.res = input.split(",")
                                        	 .map(x => parseFloat(replace(x)))
                                             .reverse()
                                        	 .reduce((xs, x) => x / xs, 1);
                        this.vars.res = String(this.vars.res);
                        break;
                    case "+":
                        assertGreater(0);
                        this.vars[input]++;
                        break;
                    case "-":
                        assertGreater(0);
                        this.vars[input]--;
                        break;
                    case "loop":
                        this.loop = true;
                        break;
                    case "stoploop":
                        this.loop = false;
                        break;
                    case "if":
                        match = /^(.*?)(=|!=|<|>)(.*?)$/.exec(input);
                        assert(match !== null, "incorrect output");
                        switch (match[2]) {
                            case "=":
                                skip = replace(match[1]) == replace(match[3]);
                                break;
                            case "!=":
                                skip = replace(match[1]) != replace(match[3]);
                                break;
                            case ">":
                                skip = replace(match[1]) > replace(match[3]);
                                break;
                            case "<":
                                skip = replace(match[1]) < replace(match[3]);
                                break;
                        }
                        skip = !skip;
                        break;
                    default:
                        throw Error(`unknown command ${JSON.stringify(command)}`)
                }
                index++;
            }

            if (this.stop) {
                this.stop = false;
                clearTimeout(this.nextIter);
                this.nextIter = null;
            } else {
                if (this.loop) this.nextIter = setTimeout(() => this.exec(code, true), this.delay);
            }
        } catch (e) {
            this.error(e, index);
        }
    },
}