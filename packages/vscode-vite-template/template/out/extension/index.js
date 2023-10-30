'use strict';

var vscode = require('vscode');

function _interopNamespaceDefault(e) {
  var n = Object.create(null);
  if (e) {
    Object.keys(e).forEach(function (k) {
      if (k !== 'default') {
        var d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: function () { return e[k]; }
        });
      }
    });
  }
  n.default = e;
  return Object.freeze(n);
}

var vscode__namespace = /*#__PURE__*/_interopNamespaceDefault(vscode);

class PageView {
    extensionUri;
    view;
    constructor(context) {
        // 设置 Uri
        this.extensionUri = context.extensionUri;
    }
    /**
     * 解析 Webview 视图。
     * @param webviewView Webview 视图实例。
     * @param context Webview 视图解析上下文。
     * @param token 取消令牌。
     */
    resolveWebviewView(webviewView, context, token) {
        this.view = webviewView;
        this.view.webview.options = {
            enableScripts: true,
            localResourceRoots: [
                this.extensionUri, // 设置路径
            ],
        };
        this.render(); // 渲染
        this.view.webview.onDidReceiveMessage((str) => {
            const message = JSON.parse(str);
            switch (message.type) {
                // 获取到页面返回的内容
                case 'update-from-page':
                    if (vscode.window.activeTextEditor) {
                        const document = vscode.window.activeTextEditor.document;
                        vscode.window.activeTextEditor.edit(editBuilder => {
                            // 获取文档内容范围
                            const start = new vscode.Position(0, 0);
                            const end = document.lineAt(document.lineCount - 1).range.end;
                            const wholeRange = new vscode.Range(start, end);
                            // 更新文档内容
                            editBuilder.replace(wholeRange, message.value);
                        });
                    }
                    break;
            }
        });
        this.build();
    }
    /**
     * 渲染 Webview 视图。
     */
    // 修改 render 方法
    render() {
        if (!this.view) {
            return;
        }
        this.view.webview.html = `<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Page</title>
        <link href="${this.getAssetUri('out/webview/index.css')}" rel="stylesheet" />
      </head>
      <body>
        <div id="app"></div>
        <script type="module" src="${this.getAssetUri('out/webview/index.js')}"></script>
      </body>
    </html>`;
    }
    /**
     * 构建 Webview 视图。
     */
    build() {
        this.update(vscode.window.activeTextEditor?.document || vscode.window.visibleTextEditors[0].document);
    }
    /**
     * 使用给定的文本文档更新 Webview 视图。
     * @param textDocument 要更新 Webview 的文本文档。
     */
    update(textDocument) {
        this.postMessage({
            type: 'update',
            value: textDocument.getText(),
        });
    }
    /**
     * 获取给定路径的资源 URI。
     * @param path 资源路径。
     * @returns 资源 URI。
     */
    getAssetUri(path) {
        return this.view?.webview.asWebviewUri(vscode.Uri.joinPath(this.extensionUri, ...path.split('/')));
    }
    ;
    /**
     * 向 Webview 视图发送消息。
     * @param message 要发送的消息。
     */
    postMessage(message) {
        this.view?.webview.postMessage(message);
    }
}

const VIEW_NAME = "test-page";

var ShowStatus;
(function (ShowStatus) {
    ShowStatus[ShowStatus["hidden"] = 0] = "hidden";
    ShowStatus[ShowStatus["show"] = 1] = "show";
})(ShowStatus || (ShowStatus = {}));
const setExpandStatus = (status) => {
    vscode.commands.executeCommand('setContext', `${VIEW_NAME}.show`, status);
};
const getDisposableList = (codeView) => {
    const commandList = [];
    vscode.commands.executeCommand('setContext', `${VIEW_NAME}.show`, ShowStatus.show);
    // 默认的命令
    commandList.push({
        name: `${VIEW_NAME}.helloWorld`,
        fn: () => {
            vscode__namespace.window.showInformationMessage('Hello World from test-page!');
        }
    });
    commandList.push({
        name: `${VIEW_NAME}.showText`,
        fn: () => {
            codeView.postMessage({
                type: 'show-text',
                value: true,
            });
            setExpandStatus(ShowStatus.show);
        }
    });
    commandList.push({
        name: `${VIEW_NAME}.hiddenText`,
        fn: () => {
            codeView.postMessage({
                type: 'hidden-text',
                value: false,
            });
            setExpandStatus(ShowStatus.hidden);
        }
    });
    return commandList;
};

const debounce = (func, delay) => {
    let timer = null;
    return function (...args) {
        if (timer) {
            clearTimeout(timer);
        }
        timer = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
};

function activate(context) {
    // webview, 实现 WebviewViewProvider
    const page = new PageView(context);
    // 监听文件变化
    vscode.window.onDidChangeActiveTextEditor(event => {
        const document = event?.document || vscode.window.activeTextEditor?.document;
        if (document) {
            page.update(document);
        }
    });
    // 监听文件内容变化
    vscode.workspace.onDidChangeTextDocument(debounce((event) => {
        const document = event.document;
        page.update(document);
    }, 300));
    // 设置页面，注意这里的 'test-page'，是 page 的 id，会在后面的 package.json 配置
    context.subscriptions.push(vscode.window.registerWebviewViewProvider(`${VIEW_NAME}`, page), ...getDisposableList(page).map(command => vscode.commands.registerCommand(command.name, command.fn.bind(null))));
}
// This method is called when your extension is deactivated
function deactivate() { }

exports.activate = activate;
exports.deactivate = deactivate;
//# sourceMappingURL=index.js.map
