import { emailHeader } from '../partials/header.ts';
import { emailFooter } from '../partials/footer.ts';

export function emailLayout(content: string): string {
  return `
<!DOCTYPE html>
<html lang="en">

<head>

<meta charset="UTF-8">

<meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
/>

<title>LinkFlow</title>

<style>

*{
    margin:0;
    padding:0;
    box-sizing:border-box;
}

body{

    background:#f4f7fb;

    font-family:
        Inter,
        Arial,
        Helvetica,
        sans-serif;

    color:#1f2937;

    padding:40px 20px;

}

.wrapper{

    max-width:640px;

    margin:auto;

}

.card{

    background:white;

    border-radius:16px;

    overflow:hidden;

    box-shadow:
        0 8px 30px rgba(0,0,0,.08);

}

.header{

    background:linear-gradient(
        135deg,
        #2563eb,
        #1d4ed8
    );

    padding:40px;

    text-align:center;

    color:white;

}

.logo{

    width:64px;

    height:64px;

    margin:auto;

    border-radius:50%;

    background:white;

    color:#2563eb;

    font-size:34px;

    display:flex;

    align-items:center;

    justify-content:center;

    margin-bottom:18px;

}

.header h1{

    font-size:30px;

    margin-bottom:10px;

}

.header p{

    opacity:.9;

    font-size:15px;

}

.content{

    padding:42px;

    font-size:16px;

    line-height:1.7;

}

.button{

    display:inline-block;

    background:#2563eb;

    color:white !important;

    padding:14px 32px;

    border-radius:10px;

    text-decoration:none;

    font-weight:600;

    margin:30px 0;

}

.button:hover{

    background:#1d4ed8;

}

.footer{

    border-top:1px solid #ececec;

    padding:28px;

    text-align:center;

    color:#6b7280;

    font-size:13px;

}

.divider{

    width:80px;

    height:1px;

    background:#e5e7eb;

    margin:20px auto;

}

</style>

</head>

<body>

<div class="wrapper">

<div class="card">

${emailHeader()}

<div class="content">

${content}

</div>

${emailFooter()}

</div>

</div>

</body>

</html>
`;
}
