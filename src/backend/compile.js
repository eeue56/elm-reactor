const elmCompiler = require('node-elm-compiler');
const path = require('path');

const defaultOptions = {
    cache: false,
    yes: true
};

const compile = function(filepath){
    return elmCompiler.compileToString(filepath, defaultOptions);
};

// TODO: Make this work with files that aren't in root
// eg Elm.Banana.Main instead of just Elm.Main
const getName = function(filepath, source){
    return "Elm." + path.basename(filepath, '.elm');
};

const toJson = function(filepath){
    return new Promise(function(resolve, reject){
        compile(filepath)
            .then(function(bufferedCode){
                const code = bufferedCode.toString("UTF-8");
                const name = getName(filepath, code);

                const obj = {
                    name: name,
                    code: code
                };

                resolve(obj);
            })
            .catch(function(err){
                const obj = {
                    error: err
                };

                reject(obj);
            });
    });
};

const toHtml = function(debug, filepath){
    return new Promise(function(resolve, reject){
        compile(filepath)
            .then(function(bufferedCode){
                const code = bufferedCode.toString("UTF-8");
                const name = getName(filepath, code);
                const bootstrapper = initialize(debug, name, filepath);

                var debugCode = "";

                if (debug){
                    debugCode = `
                        <script type="text/javascript" src="/_reactor/debug-agent.js"></script>
                    `.trim();
                }

                const template = `
                    <script type="text/javascript">${code}</script>
                    ${debugCode}
                    <script type="text/javascript">${bootstrapper}</script>
                `.trim();
                resolve(htmlDocument(name, template));
            })
            .catch(function(err){
                htmlDocument("oops!", err);
            });
    });
};

const htmlDocument = function(title, content){
    const template = `
<html>
    <head>
        <meta charset="UTF-8"></meta>
        <title>${title}</title>
        <style></style>
    </head>
    <body>
        ${content}
    </body>
</html>
    `;

    return template;
};

const initialize = function(debug, name, filepath){
    if (debug){
        return `
            var runningElmModule = Elm.fullscreenDebug(${name}, ${filepath});
        `.trim();
    }

    return `
        var runningElmModule = Elm.fullscreen(${name});
    `.trim();
};


var testInitialize = function(){
    const filepath = "./Main.elm";
    const name = "Main";
    const withoutDebug = "var runningElmModule = Elm.fullscreen(Main);";
    const withDebug = "var runningElmModule = Elm.fullscreenDebug(Main, ./Main.elm);"

    console.log("Testing initialize..");
    console.log("Without debug: ", initialize(false, name, filepath) === withoutDebug);
    console.log("With debug: ", initialize(true, name, filepath) === withDebug);
};

(function test(){

    testInitialize();

    var main = "./Main.elm";

    toJson(main)
        .then(function(json){
            console.log("To json without debug");
            console.log(Object.keys(json));
        })
        .catch(function(err){
            console.log("err", err);
        });

    // toHtml(true, main).then(function(html){
    //     console.log("To html with debug");
    //     console.log(html);
    // });

})();
