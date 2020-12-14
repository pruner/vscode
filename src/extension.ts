// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { clearRenderedCoverage, renderCoverage } from './render';
import { resetStateCache } from './state';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
    const baseOptions: vscode.DecorationRenderOptions = {
        isWholeLine: true,
		gutterIconSize: "contain",
		rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed
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

	const onRender = async () => 
		await renderCoverage(context, failedType, succeededType);

	const onStateChange = async () => {
		resetStateCache();
		await onRender();
	};

	const watcher = vscode.workspace.createFileSystemWatcher('**/.pruner/state/*', false, false, false);
	context.subscriptions.push(watcher.onDidChange(onStateChange));
	context.subscriptions.push(watcher.onDidCreate(onStateChange));
	context.subscriptions.push(watcher.onDidDelete(onStateChange));
	context.subscriptions.push(watcher);

	const onDidChangeActiveTextEditor = vscode.window.onDidChangeActiveTextEditor(async () => {
		await clearRenderedCoverage();
		await onRender();
	});
	context.subscriptions.push(onDidChangeActiveTextEditor);

	await onRender();
}

// this method is called when your extension is deactivated
export async function deactivate() {
	await clearRenderedCoverage();
}
