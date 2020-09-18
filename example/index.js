import { name, age } from "./a";

// console.log(name);
// console.log(age);

const btn = document.querySelector(".btn");
btn.addEventListener("click", () => {
    import("@/components/b").then(res => {
        console.log(res);
    });
})