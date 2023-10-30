import { CancellationToken, ExtensionContext, Position, TextDocument, Uri, WebviewView, WebviewViewProvider, WebviewViewResolveContext, window, Range } from "vscode";

// 消息类型
export type MsgType = 'update' | 'update-from-page' | 'show-text' | 'hidden-text';

export interface Msg {
  type: MsgType;
  value?: any;
}

export class PageView implements WebviewViewProvider {

  private extensionUri: Uri;

  private view: WebviewView | undefined;

  constructor(context: ExtensionContext) {
    // 设置 Uri
    this.extensionUri = context.extensionUri;
  }

  /**
   * 解析 Webview 视图。
   * @param webviewView Webview 视图实例。
   * @param context Webview 视图解析上下文。
   * @param token 取消令牌。
   */
  resolveWebviewView (webviewView: WebviewView, context: WebviewViewResolveContext<unknown>, token: CancellationToken): void | Thenable<void> {
    this.view = webviewView;

    this.view.webview.options = {
      enableScripts: true, // 允许使用 scripts，要给页面加入脚本
      localResourceRoots: [
        this.extensionUri, // 设置路径
      ],
    };

    this.render(); // 渲染
    this.view.webview.onDidReceiveMessage((str: string) => { // 监听 message
      const message = JSON.parse(str) as Msg;
      switch (message.type) {
        // 获取到页面返回的内容
        case 'update-from-page':
          if (window.activeTextEditor) {
            const document = window.activeTextEditor.document;
            window.activeTextEditor.edit(editBuilder => {
              // 获取文档内容范围
              const start = new Position(0, 0);
              const end = document.lineAt(document.lineCount - 1).range.end;
              const wholeRange = new Range(start, end);
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
  render () {
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
  build () {
    this.update(window.activeTextEditor?.document || window.visibleTextEditors[0].document);
  }

  /**
   * 使用给定的文本文档更新 Webview 视图。
   * @param textDocument 要更新 Webview 的文本文档。
   */
  update (textDocument: TextDocument) {
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
  getAssetUri (path: string) {
    return this.view?.webview.asWebviewUri(Uri.joinPath(this.extensionUri, ...path.split('/')));
  };

  /**
   * 向 Webview 视图发送消息。
   * @param message 要发送的消息。
   */
  postMessage (message: Msg) {
    this.view?.webview.postMessage(message);
  }
}