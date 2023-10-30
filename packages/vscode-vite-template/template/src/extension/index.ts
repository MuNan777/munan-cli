import * as vscode from 'vscode';
import { PageView } from './pageview';
import { TextDocumentChangeEvent, window, workspace, commands } from 'vscode';
import { getDisposableList } from './commands';
import { debounce } from '../common';
import { VIEW_NAME } from './config';

export function activate (context: vscode.ExtensionContext) {


  // webview, 实现 WebviewViewProvider
  const page = new PageView(context);

  // 监听文件变化
  window.onDidChangeActiveTextEditor(event => {
    const document = event?.document || window.activeTextEditor?.document;
    if (document) { page.update(document); }
  });

  // 监听文件内容变化
  workspace.onDidChangeTextDocument(debounce((event: TextDocumentChangeEvent) => {
    const document = event.document;
    page.update(document);
  }, 300));


  // 设置页面，注意这里的 'test-page'，是 page 的 id，会在后面的 package.json 配置
  context.subscriptions.push(
    window.registerWebviewViewProvider(`${VIEW_NAME}`, page),
    ...getDisposableList(page).map(command => commands.registerCommand(command.name, command.fn.bind(null))));
}

// This method is called when your extension is deactivated
export function deactivate () { }