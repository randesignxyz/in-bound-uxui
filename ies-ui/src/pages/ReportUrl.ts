export const getUrlReporting=(url: string) => {
    const baseUrl:string = 'QA'    
    switch (baseUrl) {
        case 'QA': return `/Reports/qa/${url}`
        case 'PRO': return `/Reports/${url}`
        default: throw Error(`${url} cannot be found`)
    }
}