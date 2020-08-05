export declare interface ResourceRoute {
    path: string;
    data: string;
    contentType: string;
}

export declare interface TemplateRoute {
    tpl: string;
    resource: ResourceRoute[];
}