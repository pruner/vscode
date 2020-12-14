import * as vscode from "vscode";

import { io, pruner } from '@pruner/cli';
import _ from "lodash";
import { ProviderState } from "@pruner/cli/dist/src/providers/types";

let currentStates: Promise<ProviderState[]> | null = null;

export function resetStateCache(logChannel: vscode.OutputChannel) {
    logChannel.appendLine("Cache has been reset.");
    currentStates = null;
}

export async function getStatesInWorkspace() {
    if(currentStates) {
        return await currentStates;
    }

    currentStates = (async () => _.flatMap(
        await Promise.all(_.flatMap(
            vscode.workspace.workspaceFolders || new Array<vscode.WorkspaceFolder>(),
            async folder => {
                const settings = await pruner.readSettings(folder.uri.fsPath);
                if(!settings) {
                    return [];
                }

                return await Promise.all(settings
                    .providers
                    .map(async provider => 
                        await pruner.readState(provider.id, folder.uri.fsPath)));
            }))))();

    return currentStates;
}