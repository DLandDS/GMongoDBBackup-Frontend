export default function mergeObjects<T extends object>(
    template: T,
    ...objs: any[]
): T {
    let obj = structuredClone(template) as any;

    for (let i = 0; i < objs.length; i++) {
        const obj2 = objs[i];
        for (let property in obj2) {
            if (obj.hasOwnProperty(property)) {
                if (
                    typeof obj[property] === "object" &&
                    typeof obj2[property] === "object"
                ) {
                    obj[property] = mergeObjects(obj[property], obj2[property]);
                } else {
                    obj[property] = obj2[property];
                }
            }
        }
    }

    return obj;
}
