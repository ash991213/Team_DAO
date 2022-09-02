"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const emailTemplate = (number) => {
    return `<div style="text-align: center; width: 60%; height: 50%; margin: 15%; padding: 20px; border: 2px solid #ffb6c1; border-radius: 10px; background-color: #fffafa">
<h2 style="color: pink; font-weight: bold">아래 6자리 숫자를 화면에 입력해주세요.</h2>
<br />
<div style="display: flex; justify-content: space-between">
    <div style="width: 5rem; height: 5rem; border: 2px solid #ffb6c1; border-radius: 10px; background-color: #fffafa">
        <h1 style="text-align: center; font-weight: bold; font-size: 47px; color: #ffb6c1">${number[0]}</h1>
    </div>
    <div style="width: 5rem; height: 5rem; border: 2px solid #ffb6c1; border-radius: 10px; background-color: #fffafa">
        <h1 style="text-align: center; font-weight: bold; font-size: 47px; color: #ffb6c1">${number[1]}</h1>
    </div>
    <div style="width: 5rem; height: 5rem; border: 2px solid #ffb6c1; border-radius: 10px; background-color: #fffafa">
        <h1 style="text-align: center; font-weight: bold; font-size: 47px; color: #ffb6c1">${number[2]}</h1>
    </div>

    <div style="width: 5rem; height: 5rem; border: 2px solid #ffb6c1; border-radius: 10px; background-color: #fffafa">
        <h1 style="text-align: center; font-weight: bold; font-size: 47px; color: #ffb6c1">${number[3]}</h1>
    </div>

    <div style="width: 5rem; height: 5rem; border: 2px solid #ffb6c1; border-radius: 10px; background-color: #fffafa">
        <h1 style="text-align: center; font-weight: bold; font-size: 47px; color: #ffb6c1">${number[4]}</h1>
    </div>

    <div style="width: 5rem; height: 5rem; border: 2px solid #ffb6c1; border-radius: 10px; background-color: #fffafa">
        <h1 style="text-align: center; font-weight: bold; font-size: 47px; color: #ffb6c1">${number[5]}</h1>
    </div>
</div>
</div>`;
};
exports.default = emailTemplate;
