import { io } from "@pruner/cli";
import _, { chain } from "lodash";
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

    const relevantTests = chain(states)
        .flatMap(x => x.tests)
        .filter(t => !!t.fileCoverage
            .find(f => editorPath.endsWith(f.path)))
        .flatMap(t => t.fileCoverage
            .map(f => ({
                file: f,
                test: t
            })))
        .filter(x => editorPath.endsWith(x.file.path))
        .value();

    const coveredLines = chain(relevantTests)
        .flatMap(x => x.file.lineCoverage
            .map(l => ({
                test: x.test,
                line: l
            })))
        .groupBy(l => l.line)
        .map(g => ({
            line: g[0].line,
            tests: g.map(t => t.test)
        }))
        .value();

    const failedRanges = new Array<vscode.Range>();
    const succeededRanges = new Array<vscode.Range>();

    for(let lineCoverage of coveredLines) {
        const failed = lineCoverage.tests.find(x => !!x.failure);
        
        const targetArray = failed ?
            failedRanges :
            succeededRanges;
        targetArray.push(new vscode.Range(
            new vscode.Position(lineCoverage.line - 1, 0),
            new vscode.Position(lineCoverage.line - 1, 0)));
    }
    
    activeEditor.setDecorations(failedType, failedRanges);
    activeEditor.setDecorations(succeededType, succeededRanges);
}

export async function clearRenderedCoverage() {

}