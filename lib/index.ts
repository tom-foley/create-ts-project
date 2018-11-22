import * as fs from 'fs';
import * as path from 'path';
import { exec, ExecException, ChildProcess, ExecOptions } from "child_process";

function logError(msg: string): void {
    console.error(`ERROR: ${msg}`);
}

function isDefined(obj: any): boolean {
    return typeof (obj) !== typeof (undefined) && obj !== null;
}

export default function generate(projectName: string): void {
    if (!isDefined(projectName) || projectName.length === 0) {
        return logError('project name not supplied');
    }

    try {
        const newProjectPath: string = path.resolve(process.cwd(), projectName);
        const exists: boolean = fs.existsSync(newProjectPath);

        if (exists) {
            return logError('a file or folder  with the specified project name already exists');
        }

        const mkDirOpts: fs.MakeDirectoryOptions = {
            recursive: true
        };

        fs.mkdirSync(newProjectPath, mkDirOpts);

        const newVsCodeFolderPath: string = newProjectPath + path.sep + '.vscode';
        fs.mkdirSync(newVsCodeFolderPath, mkDirOpts);

        const thisResourcesPath: string = path.resolve(__dirname, '../', 'resources');
        const thisVsCodeFolderPath: string = path.resolve(thisResourcesPath, 'vscode');

        fs.copyFileSync(
            thisVsCodeFolderPath + path.sep + '_launch.json',
            newVsCodeFolderPath + path.sep + 'launch.json'
        );
        fs.copyFileSync(
            thisVsCodeFolderPath + path.sep + '_settings.json',
            newVsCodeFolderPath + path.sep + 'settings.json'
        );
        fs.copyFileSync(
            thisVsCodeFolderPath + path.sep + '_tasks.json',
            newVsCodeFolderPath + path.sep + 'tasks.json'
        );

        const srcCodeFolderPath: string = newProjectPath + path.sep + 'src';
        fs.mkdirSync(srcCodeFolderPath, mkDirOpts);

        const newPackageJsonPath: string = newProjectPath + path.sep + 'package.json';
        fs.copyFileSync(
            thisResourcesPath + path.sep + '_package.json',
            newPackageJsonPath
        );
        fs.copyFileSync(
            thisResourcesPath + path.sep + '_tsconfig.json',
            newProjectPath + path.sep + 'tsconfig.json'
        );

        const packageJsonBuf: Buffer = fs.readFileSync(newPackageJsonPath);
        const packageJsonStr: string = packageJsonBuf.toString();
        const packageJsonObj: any = JSON.parse(packageJsonStr);

        packageJsonObj.name = projectName;

        fs.writeFileSync(newPackageJsonPath, JSON.stringify(packageJsonObj, null, 2));

        const execOpts: ExecOptions = {
            cwd: newProjectPath
        };

        const execCb = (err: ExecException | null, stdout: string, stderr: string): void => {
            if (err) {
                return logError(err.message);
            }

            console.log(stdout);
        };

        const child: ChildProcess = exec('npm install', execOpts, execCb);
    }
    catch (e) {
        return logError((e as NodeJS.ErrnoException).message);
    }
}