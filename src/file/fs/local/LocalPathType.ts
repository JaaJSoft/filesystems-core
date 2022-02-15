/* A type that represents the type of local path. */
export enum LocalPathType {
    ABSOLUTE,                   //  C:\foo
    UNC,                        //  \\server\share\foo
    RELATIVE,                   //  foo
    DIRECTORY_RELATIVE,         //  \foo
    DRIVE_RELATIVE              //  C:foo
}