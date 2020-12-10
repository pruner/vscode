// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { clearRenderedCoverage, renderCoverage } from './render';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
	vscode.window.onDidChangeActiveTextEditor(renderCoverage);
	await renderCoverage();
}

// this method is called when your extension is deactivated
export async function deactivate() {
	await clearRenderedCoverage();
}
