import { io } from "@pruner/cli";
import _ from "lodash";
import * as vscode from 'vscode';

import { getStatesInWorkspace } from "./state";

export async function renderCoverage(
    context: vscode.ExtensionContext,
    failedType: vscode.TextEditorDecorationType,
    succeededType: vscode.TextEditorDecorationType) 
{
    const activeEditor = vscode.window.activeTextEditor;
    if(!activeEditor) {
        return;
    }

    const states = await getStatesInWorkspace();
    const file = _
        .flatMap(states, x => x.files)
        .find(f => io
            .normalizePathSeparators(activeEditor.document.uri.fsPath)
            .endsWith(f.path));
    if(!file) {
        return;
    }

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