import { io } from "@pruner/cli";
import _ from "lodash";
import * as vscode from 'vscode';

import { getStatesInWorkspace } from "./state";

export async function renderCoverage() {
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

    const coverageForFile = _
        .flatMap(states, x => x.coverage)
        .filter(l => l.fileId === file.id);

    const whitespaceType = vscode.window.createTextEditorDecorationType({
        before: {
            backgroundColor: 'rgba(0,0,0,0)',
            contentText: " ",
        }
    });

    const succeededType = vscode.window.createTextEditorDecorationType({
        before: {
            backgroundColor: 'green',
            contentText: " ",
        }
    });
    const failedType = vscode.window.createTextEditorDecorationType({
        before: {
            backgroundColor: 'red',
            contentText: " ",
        }
    });

    activeEditor.setDecorations(whitespaceType, [
        new vscode.Range(
            new vscode.Position(0, 0),
            new vscode.Position(0, 1000))
    ]);

    activeEditor.setDecorations(whitespaceType, [
        new vscode.Range(
            new vscode.Position(1, 0),
            new vscode.Position(1, 1000))
    ]);

    activeEditor.setDecorations(whitespaceType, [
        new vscode.Range(
            new vscode.Position(3, 0),
            new vscode.Position(3, 1000))
    ]);

    for(let lineCoverage of coverageForFile) {
        activeEditor.setDecorations(failedType, [
            new vscode.Range(
                new vscode.Position(lineCoverage.lineNumber - 1, 0),
                new vscode.Position(lineCoverage.lineNumber - 1, 1000))
        ]);
    }
}

export async function clearRenderedCoverage() {

}