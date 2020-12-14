import { io } from "@pruner/cli";
import _ from "lodash";
import * as vscode from 'vscode';

import { getStatesInWorkspace } from "./state";

export async function renderCoverage(
    failedType: vscode.TextEditorDecorationType,
    succeededType: vscode.TextEditorDecorationType,
    logChannel: vscode.OutputChannel) 
{
    const activeEditor = vscode.window.activeTextEditor;
    if(!activeEditor) {
        logChannel.appendLine("No active editor found.");
        return;
    }

    const states = await getStatesInWorkspace();
    const editorPath = io.normalizePathSeparators(activeEditor.document.uri.fsPath);
    logChannel.appendLine(`Scanning for coverage for path ${editorPath}`);

    const file = _
        .flatMap(states, x => x.files)
        .find(f => editorPath.endsWith(f.path));
    if(!file) {
        logChannel.appendLine("No file found for current editor file path.");
        return;
    }

    logChannel.appendLine(`Coverage found under file ID ${file.id}`);

    const tests = _.flatMap(states, x => x.tests);

    const coverageForFile = _
        .flatMap(states, x => x.coverage)
        .filter(l => l.fileId === file.id);

    const failedRanges = new Array<vscode.Range>();
    const succeededRanges = new Array<vscode.Range>();

    for(let lineCoverage of coverageForFile) {
        const lineTests = tests.filter(t => lineCoverage.testIds.find(i => i === t.id));
        const failed = lineTests.find(x => !x.passed);
        
        const targetArray = failed ?
            failedRanges :
            succeededRanges;
        targetArray.push(new vscode.Range(
            new vscode.Position(lineCoverage.lineNumber - 1, 0),
            new vscode.Position(lineCoverage.lineNumber - 1, 0)));
    }
    
    activeEditor.setDecorations(failedType, failedRanges);
    activeEditor.setDecorations(succeededType, succeededRanges);
}

export async function clearRenderedCoverage() {

}