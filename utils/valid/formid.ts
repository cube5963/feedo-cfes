export function isValidFormId(id: string | null): boolean {
    return typeof id === 'string' && (/^[a-zA-Z0-9\-_]+$/.test(id) || /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(id));
}