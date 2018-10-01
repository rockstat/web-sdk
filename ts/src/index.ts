
class Hello {
    i: number;
    items: number[] = [1, 3, 4];
    constructor() {
        this.i = 1
        for (const n of this.items) {
            console.log(n);
        }
    }
}



const c = new Hello;
export { c }

