export const TPL_SEPARATOR_RULE: RegExp = /\<\/body\>(\r|\n)+\<\/html\>/;
export const TPL_SEPARATOR_VALUE: string = "</body>\r</html>";
export const IMPORTED_STATEMENT_RULE: RegExp = /import\s+\{?\s*\w*\s*\}?\s+from\s+("|').+("|');*/g;
export const COMMENT_IMPORTED_STATEMENT_RULE: RegExp = /(\/\/|\/\*)(\s|\n)*import\s+\{?\s*\w*\s*\}?\s+from\s+("|').+("|');*/g;
export const DYNAMIC_IMPORTED_STATEMENT_RULE: RegExp =/import\s*\(.+\)/g;
export const MIME_MAP: any = {
    ".js": "text/javascript",
    ".png": "image/png",
    ".jpg": "image/jpg",
    ".gif": "image/gif"
}
export const DEFAULT_EXTNAMES = [".js"];
