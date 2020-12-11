// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { clearRenderedCoverage, renderCoverage } from './render';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
    const baseOptions: vscode.DecorationRenderOptions = {
        isWholeLine: true,
        gutterIconSize: "contain"
    };

    const succeededType = vscode.window.createTextEditorDecorationType({
        ...baseOptions,
        gutterIconPath: context.asAbsolutePath('resources/succeeded.svg'),
        backgroundColor: 'rgba(0, 255, 0, 0.01)'
    });
	context.subscriptions.push(succeededType);

    const failedType = vscode.window.createTextEditorDecorationType({
        ...baseOptions,
        gutterIconPath: context.asAbsolutePath('resources/failed.svg'),
        backgroundColor: 'rgba(255, 0, 0, 0.01)'
	});
	context.subscriptions.push(failedType);

	const onRender = () => 
		renderCoverage(context, failedType, succeededType);
	
	const watcher = vscode.workspace.createFileSystemWatcher('**/.pruner/state/*', false, false, false);
	context.subscriptions.push(watcher.onDidChange(onRender));
	context.subscriptions.push(watcher.onDidCreate(onRender));
	context.subscriptions.push(watcher.onDidDelete(onRender));
	context.subscriptions.push(watcher);

	const onDidChangeActiveTextEditor = vscode.window.onDidChangeActiveTextEditor(onRender);
	context.subscriptions.push(onDidChangeActiveTextEditor);

	await onRender();
}

// this method is called when your extension is deactivated
export async function deactivate() {
	await clearRenderedCoverage();
}
