import crypto from 'crypto';
import PptxGenJS from "pptxgenjs";
import { backgroundurl, backgroundurl1, slide1imageUrl1, slide1imageUrl2 } from './base64.js';
import { storePresentatonFile } from '../../../../supabase/index.js';
import { logErrorToBugsnag } from '../../../../utils/helper/helper.js';

function BulletPointDefaultFrontPage(pptx, title, subtitle, imageUrl, disablePhtoGenerationText) {
    try {
        let slide1 = pptx.addSlide('MASTER_SLIDE');

        slide1.addImage({
            data: backgroundurl(),
            x: '0%',
            y: '0%',
            w: '100%',
            h: "100%",
        });

        slide1.addShape(pptx.shapes.LINE, {
            x: '0%',
            y: '90%',
            w: '100%',
            h: 0,
            line: { color: '#A9A9A9', width: 1 }
        });

        slide1.addText(
            title,
            { x: "10%", y: "45%", h: 0.3, fontSize: 33, color: '#17A33E', w: "40%", bold: true, fontFace: "Plus Jakarta Sans", valign: "bottom", lineSpacing: 35 }
        );

        slide1.addText(
            subtitle,
            { x: "10%", y: "50%", h: 0.3, fontSize: 12, color: '#000000', w: "40%", fontFace: "Plus Jakarta Sans Light", valign: "top" }
        );

        slide1.addImage({
            data: slide1imageUrl2(),
            x: '59%',
            y: '9%',
            w: '7.5%',
            h: "10%",
        });

        slide1.addImage({
            data: slide1imageUrl2(),
            x: '85%',
            y: '71%',
            w: '7.5%',
            h: "10%",
        });

        slide1.addShape(pptx.shapes.RECTANGLE, {
            x: '62.5%',
            y: '14%',
            w: '26%',
            h: "62%",
            fill: { color: '#ffffff' },
            rectRadius: 0.2
        });

        slide1.addImage({
            path: imageUrl,
            x: '63%',
            y: '15%',
            w: '25%',
            h: "60%",
        });

        slide1.addText(
            generateCurrentMonthAndYear(),
            { x: "5%", y: "92%", h: 0.3, fontSize: 15, color: '#000000', w: "30%", fontFace: "Plus Jakarta Sans SemiBold", valign: "center" }
        );

        if (!disablePhtoGenerationText) {
            slide1.addText(
                [
                    {
                        text: "Photo by Pexels",
                        options: { hyperlink: { url: "https://pexels.com/?utm_source=magicslides.app&utm_medium=presentation", tooltip: "Pexel" } },
                    },
                ],
                { x: "64%", y: "73%", w: 2, h: 0.5, fontSize: 8, color: "#FFFFFF" }
            );
        }
    } catch (error) {
        console.log("Error in BulletPointDefaultFrontPage: ", error);
    }
}

function generateCurrentMonthAndYear() {
    const currentDate = new Date();

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const currentMonth = months[currentDate.getMonth()];
    const currentYear = currentDate.getFullYear();

    const result = `${currentMonth} ${currentYear}`;
    return result;
}

function formatSlideToStart(slideToStart) {
    // Convert to number if it's a string
    let slideNumber = Number(slideToStart);

    // Check if it's a valid number
    if (isNaN(slideNumber)) {
        return "01";
    }

    // Format with leading zero if less than 10
    if (slideNumber < 10) {
        return `0${slideNumber}`;
    } else {
        return slideNumber.toString();
    }
}

const agendaTextExists = (index, agenda) => {
    return agenda[index] && agenda[index].text;
};

function BulletPointDefaultPPTAgendaPage(pptx, content) {
    try {
        console.log("Content: ", content);
        const agenda = [];

        for (let i = 0; i < content.length; i++) {
            const contObj = {
                text: content[i]
            }
            agenda.push(contObj);
        }
        console.log("Agenda: ", JSON.stringify(agenda));


        let totalLength = agenda.length;
        let indexCounter = 0;
        let tableofcontent = null;
        let isTocName = true;

        while (totalLength > 0) {

            // Check condition that the below code will run in 0th index, 8th index, 16th index, 24th index, 32nd index, 40th index ...
            if (indexCounter === 0 || indexCounter % 8 === 0) {
                tableofcontent = pptx.addSlide('MASTER_SLIDE');

                tableofcontent.addImage({
                    data: backgroundurl1(),
                    x: '0%',
                    y: '0%',
                    w: '100%',
                    h: "100%",
                });
                if (isTocName) {
                    tableofcontent.addText(
                        "Table of Contents",
                        { x: "5%", y: "9%", h: 0.3, fontSize: 32, color: '#17A33E', w: "90%", bold: true, fontFace: "Plus Jakarta Sans", valign: "center", align: "left" }
                    );
                    isTocName = false;
                }
                console.log("Total Length: ", totalLength);



                tableofcontent.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
                    x: '8%',
                    y: '25%',
                    w: '38%',
                    h: "10%",
                    line: { color: '#17A33E', width: 1 },
                    fill: { color: '#E8FFEF' },
                    rectRadius: 0.5
                });


                tableofcontent.addShape(pptx.shapes.OVAL, {
                    x: '6.5%',
                    y: '26%',
                    w: '4.5%',
                    h: "8%",
                    line: { color: '#ffffff', width: 4 },
                    fill: { color: '#ffffff' }
                });


                tableofcontent.addShape(pptx.shapes.OVAL, {
                    x: '7%',
                    y: '27%',
                    w: '3.5%',
                    h: "6%",
                    line: { color: '#17A33E', width: 4 },
                    fill: { color: '#17A33E' }
                });


                tableofcontent.addText(
                    `${indexCounter + 1}`,
                    { x: "7%", y: "26%", h: "8%", fontSize: 14, color: '#ffffff', w: "4%", fontFace: "Plus Jakarta Sans", bold: true, valign: "center", align: "center" }
                );

                tableofcontent.addText(
                    agendaTextExists(indexCounter, agenda) ? agenda[indexCounter].text : "",
                    { x: "12%", y: "26%", h: "8%", fontSize: 14, color: '#000000', w: "35%", fontFace: "Plus Jakarta Sans", bold: true, valign: "center", align: "left" }
                );



            }

            // check condition that the below code will run in 4th index, 12th index, 20th index, 28th index, 36th index, 44th index ...
            else if (indexCounter === 4 || indexCounter % 8 === 4) {
                tableofcontent.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
                    x: '55%',
                    y: '25%',
                    w: '38%',
                    h: "10%",
                    line: { color: '#17A33E', width: 1 },
                    fill: { color: '#E8FFEF' },
                    rectRadius: 0.5
                });

                tableofcontent.addShape(pptx.shapes.OVAL, {
                    x: '53.5%',
                    y: '26%',
                    w: '4.5%',
                    h: "8%",
                    line: { color: '#ffffff', width: 4 },
                    fill: { color: '#ffffff' }
                });


                tableofcontent.addShape(pptx.shapes.OVAL, {
                    x: '54%',
                    y: '27%',
                    w: '3.5%',
                    h: "6%",
                    line: { color: '#17A33E', width: 4 },
                    fill: { color: '#17A33E' }
                });

                tableofcontent.addText(
                    `${indexCounter + 1}`,
                    { x: "54%", y: "26%", h: "8%", fontSize: 14, color: '#ffffff', w: "4%", fontFace: "Plus Jakarta Sans", bold: true, valign: "center", align: "center" }
                );

                tableofcontent.addText(
                    agendaTextExists(indexCounter, agenda) ? agenda[indexCounter].text : "",
                    { x: "59%", y: "26%", h: "8%", fontSize: 14, color: '#000000', w: "35%", fontFace: "Plus Jakarta Sans", bold: true, valign: "center", align: "left" }
                );

            }

            // check codition that the bellow code will be run in 1st index, 9th index, 17th index, 25th index, 33rd index, 41st index ...
            else if (indexCounter === 1 || indexCounter % 8 === 1) {
                tableofcontent.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
                    x: '8%',
                    y: '40%',
                    w: '38%',
                    h: "10%",
                    line: { color: '#17A33E', width: 1 },
                    fill: { color: '#E8FFEF' },
                    rectRadius: 0.5
                });

                tableofcontent.addShape(pptx.shapes.OVAL, {
                    x: '6.5%',
                    y: '41%',
                    w: '4.5%',
                    h: "8%",
                    line: { color: '#ffffff', width: 4 },
                    fill: { color: '#ffffff' }
                });


                tableofcontent.addShape(pptx.shapes.OVAL, {
                    x: '7%',
                    y: '42%',
                    w: '3.5%',
                    h: "6%",
                    line: { color: '#17A33E', width: 4 },
                    fill: { color: '#17A33E' }
                });

                tableofcontent.addText(
                    `${indexCounter + 1}`,
                    { x: "7%", y: "41%", h: "8%", fontSize: 14, color: '#ffffff', w: "4%", fontFace: "Plus Jakarta Sans", bold: true, valign: "center", align: "center" }
                );


                tableofcontent.addText(
                    agendaTextExists(indexCounter, agenda) ? agenda[indexCounter].text : "",
                    { x: "12%", y: "41%", h: "8%", fontSize: 14, color: '#000000', w: "35%", fontFace: "Plus Jakarta Sans", bold: true, valign: "center", align: "left" }
                );


            }

            else if (indexCounter === 5 || indexCounter % 8 === 5) {
                tableofcontent.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
                    x: '55%',
                    y: '40%',
                    w: '38%',
                    h: "10%",
                    line: { color: '#17A33E', width: 1 },
                    fill: { color: '#E8FFEF' },
                    rectRadius: 0.5
                });

                tableofcontent.addShape(pptx.shapes.OVAL, {
                    x: '53.5%',
                    y: '41%',
                    w: '4.5%',
                    h: "8%",
                    line: { color: '#ffffff', width: 4 },
                    fill: { color: '#ffffff' }
                });


                tableofcontent.addShape(pptx.shapes.OVAL, {
                    x: '54%',
                    y: '42%',
                    w: '3.5%',
                    h: "6%",
                    line: { color: '#17A33E', width: 4 },
                    fill: { color: '#17A33E' }
                });


                tableofcontent.addText(
                    `${indexCounter + 1}`,
                    { x: "54%", y: "41%", h: "8%", fontSize: 14, color: '#ffffff', w: "4%", fontFace: "Plus Jakarta Sans", bold: true, valign: "center", align: "center" }
                );

                tableofcontent.addText(
                    agendaTextExists(indexCounter, agenda) ? agenda[indexCounter].text : "",
                    { x: "59%", y: "41%", h: "8%", fontSize: 14, color: '#000000', w: "35%", fontFace: "Plus Jakarta Sans", bold: true, valign: "center", align: "left" }
                );


            }

            else if (indexCounter === 2 || indexCounter % 8 === 2) {
                tableofcontent.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
                    x: '8%',
                    y: '55%',
                    w: '38%',
                    h: "10%",
                    line: { color: '#17A33E', width: 1 },
                    fill: { color: '#E8FFEF' },
                    rectRadius: 0.5
                });

                // 3rd
                tableofcontent.addShape(pptx.shapes.OVAL, {
                    x: '6.5%',
                    y: '56%',
                    w: '4.5%',
                    h: "8%",
                    line: { color: '#ffffff', width: 4 },
                    fill: { color: '#ffffff' }
                });


                tableofcontent.addShape(pptx.shapes.OVAL, {
                    x: '7%',
                    y: '57%',
                    w: '3.5%',
                    h: "6%",
                    line: { color: '#17A33E', width: 4 },
                    fill: { color: '#17A33E' }
                });

                tableofcontent.addText(
                    `${indexCounter + 1}`,
                    { x: "7%", y: "56%", h: "8%", fontSize: 14, color: '#ffffff', w: "4%", fontFace: "Plus Jakarta Sans", bold: true, valign: "center", align: "center" }
                );


                tableofcontent.addText(
                    agendaTextExists(indexCounter, agenda) ? agenda[indexCounter].text : "",
                    { x: "12%", y: "56%", h: "8%", fontSize: 14, color: '#000000', w: "35%", fontFace: "Plus Jakarta Sans", bold: true, valign: "center", align: "left" }
                );

            }

            else if (indexCounter === 6 || indexCounter % 8 === 6) {
                tableofcontent.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
                    x: '55%',
                    y: '55%',
                    w: '38%',
                    h: "10%",
                    line: { color: '#17A33E', width: 1 },
                    fill: { color: '#E8FFEF' },
                    rectRadius: 0.5
                });

                tableofcontent.addShape(pptx.shapes.OVAL, {
                    x: '53.5%',
                    y: '56%',
                    w: '4.5%',
                    h: "8%",
                    line: { color: '#ffffff', width: 4 },
                    fill: { color: '#ffffff' }
                });


                tableofcontent.addShape(pptx.shapes.OVAL, {
                    x: '54%',
                    y: '57%',
                    w: '3.5%',
                    h: "6%",
                    line: { color: '#17A33E', width: 4 },
                    fill: { color: '#17A33E' }
                });


                tableofcontent.addText(
                    `${indexCounter + 1}`,
                    { x: "54%", y: "56%", h: "8%", fontSize: 14, color: '#ffffff', w: "4%", fontFace: "Plus Jakarta Sans", bold: true, valign: "center", align: "center" }
                );

                tableofcontent.addText(
                    agendaTextExists(indexCounter, agenda) ? agenda[indexCounter].text : "",
                    { x: "59%", y: "56%", h: "8%", fontSize: 14, color: '#000000', w: "35%", fontFace: "Plus Jakarta Sans", bold: true, valign: "center", align: "left" }
                );


            }

            else if (indexCounter === 3 || indexCounter % 8 === 3) {
                tableofcontent.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
                    x: '8%',
                    y: '70%',
                    w: '38%',
                    h: "10%",
                    line: { color: '#17A33E', width: 1 },
                    fill: { color: '#E8FFEF' },
                    rectRadius: 0.5
                });

                tableofcontent.addShape(pptx.shapes.OVAL, {
                    x: '6.5%',
                    y: '71%',
                    w: '4.5%',
                    h: "8%",
                    line: { color: '#ffffff', width: 4 },
                    fill: { color: '#ffffff' }
                });


                tableofcontent.addShape(pptx.shapes.OVAL, {
                    x: '7%',
                    y: '72%',
                    w: '3.5%',
                    h: "6%",
                    line: { color: '#17A33E', width: 4 },
                    fill: { color: '#17A33E' }
                });


                tableofcontent.addText(
                    `${indexCounter + 1}`,
                    { x: "7%", y: "71%", h: "8%", fontSize: 14, color: '#ffffff', w: "4%", fontFace: "Plus Jakarta Sans", bold: true, valign: "center", align: "center" }
                );

                tableofcontent.addText(
                    agendaTextExists(indexCounter, agenda) ? agenda[indexCounter].text : "",
                    { x: "12%", y: "71%", h: "8%", fontSize: 14, color: '#000000', w: "35%", fontFace: "Plus Jakarta Sans", bold: true, valign: "center", align: "left" }
                );


            }

            else if (indexCounter === 7 || indexCounter % 8 === 7) {
                tableofcontent.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
                    x: '55%',
                    y: '70%',
                    w: '38%',
                    h: "10%",
                    line: { color: '#17A33E', width: 1 },
                    fill: { color: '#E8FFEF' },
                    rectRadius: 0.5
                });

                tableofcontent.addShape(pptx.shapes.OVAL, {
                    x: '53.5%',
                    y: '71%',
                    w: '4.5%',
                    h: "8%",
                    line: { color: '#ffffff', width: 4 },
                    fill: { color: '#ffffff' }
                });


                tableofcontent.addShape(pptx.shapes.OVAL, {
                    x: '54%',
                    y: '72%',
                    w: '3.5%',
                    h: "6%",
                    line: { color: '#17A33E', width: 4 },
                    fill: { color: '#17A33E' }
                });

                tableofcontent.addText(
                    `${indexCounter + 1}`,
                    { x: "54%", y: "71%", h: "8%", fontSize: 14, color: '#ffffff', w: "4%", fontFace: "Plus Jakarta Sans", bold: true, valign: "center", align: "center" }
                );


                tableofcontent.addText(
                    agendaTextExists(indexCounter, agenda) ? agenda[indexCounter].text : "",
                    { x: "59%", y: "71%", h: "8%", fontSize: 14, color: '#000000', w: "35%", fontFace: "Plus Jakarta Sans", bold: true, valign: "center", align: "left" }
                );
            }


            indexCounter += 1;
            totalLength -= 1;
        }

        return 0;
    } catch (error) {
        console.log("Error: ", error);
        return 0;
    }
}

function pptThirdPage(pptx, slideToStart, slideData, disablePhtoGenerationText) {
    try {
        let slide = pptx.addSlide('MASTER_SLIDE');

        slide.addImage({
            data: backgroundurl(),
            x: '0%',
            y: '0%',
            w: '100%',
            h: "100%",
        });

        slide.addText(
            slideData.title,
            { x: "5%", y: "13%", h: 0.3, fontSize: 33, color: '#17A33E', w: "90%", bold: true, fontFace: "Plus Jakarta Sans", valign: "center", lineSpacing: 35 }
        );

        const slideData1 = [
            { text: slideData.bodyContent[0] ?? "", options: { bullet: { type: 'number' }, indentLevel: 0, paraSpaceAfter: 12 } },
            { text: slideData.bodyContent[1] ?? "", options: { bullet: { type: 'number' }, indentLevel: 0, paraSpaceAfter: 12 } },
            { text: slideData.bodyContent[2] ?? "", options: { bullet: { type: 'number' }, indentLevel: 0, paraSpaceAfter: 12 } },
            { text: slideData.bodyContent[3] ?? "", options: { bullet: { type: 'number' }, indentLevel: 0, paraSpaceAfter: 12 } }
        ];

        slide.addText(slideData1, { color: "#000000", fontSize: 12, lineSpacing: 20, x: "5%", y: "25%", valign: "top", fontFace: "Plus Jakarta Sans Light", h: 3, w: "65%" });

        slide.addShape(pptx.shapes.RECTANGLE, {
            x: '77.5%',
            y: '27%',
            w: '21%',
            h: "57%",
            fill: { color: '#ffffff' },
            rectRadius: 0.2
        });

        slide.addImage({
            path: slideData.imageSearch,
            x: '78%',
            y: '28%',
            w: '20%',
            h: "55%",
        });

        // footer

        slide.addShape(pptx.shapes.LINE, {
            x: '0%',
            y: '90%',
            w: '100%',
            h: 0,
            line: { color: '#A9A9A9', width: 1 }
        });

        slide.addText(
            formatSlideToStart(slideToStart),
            { x: "5%", y: "92%", h: 0.3, fontSize: 15, color: '#000000', w: "30%", fontFace: "Plus Jakarta Sans SemiBold", valign: "center" }
        );

        // Slide12.addText(
        //     footer.company,
        //     { x: "55%", y: "92%", h: 0.3, fontSize: 15, color: '#000000', w: "40%", fontFace: "Plus Jakarta Sans SemiBold", valign: "center", align: "right" }
        // );


        if (!disablePhtoGenerationText) {
            slide.addText(
                [
                    {
                        text: "Photo by Pexels",
                        options: { hyperlink: { url: "https://pexels.com/?utm_source=magicslides.app&utm_medium=presentation", tooltip: "Pexel" } },
                    },
                ],
                { x: "79%", y: "80%", w: 2, h: 0.5, fontSize: 8, color: "#FFFFFF" }
            );
        }
    } catch (error) {
        console.log("Error in pptThirdPage: ", error);
    }
}

function pptThirdPageWithoutImage(pptx, slideToStart, slideData) {
    try {
        let slide = pptx.addSlide('MASTER_SLIDE');

        slide.addImage({
            data: backgroundurl(),
            x: '0%',
            y: '0%',
            w: '100%',
            h: "100%",
        });

        slide.addText(
            slideData.title,
            { x: "5%", y: "13%", h: 0.3, fontSize: 33, color: '#17A33E', w: "90%", bold: true, fontFace: "Plus Jakarta Sans", valign: "center", lineSpacing: 35 }
        );

        const slideData1 = [
            { text: slideData.bodyContent[0] ?? "", options: { bullet: { type: 'number' }, indentLevel: 0, paraSpaceAfter: 12 } },
            { text: slideData.bodyContent[1] ?? "", options: { bullet: { type: 'number' }, indentLevel: 0, paraSpaceAfter: 12 } },
            { text: slideData.bodyContent[2] ?? "", options: { bullet: { type: 'number' }, indentLevel: 0, paraSpaceAfter: 12 } },
            { text: slideData.bodyContent[3] ?? "", options: { bullet: { type: 'number' }, indentLevel: 0, paraSpaceAfter: 12 } },
            { text: slideData.bodyContent[4] ?? "", options: { bullet: { type: 'number' }, indentLevel: 0, paraSpaceAfter: 12 } }
        ];

        slide.addText(slideData1, { color: "#000000", fontSize: 14, lineSpacing: 20, x: "5%", y: "25%", valign: "top", fontFace: "Plus Jakarta Sans Light", h: 3, w: "90%" });

        // footer
        slide.addShape(pptx.shapes.LINE, {
            x: '0%',
            y: '90%',
            w: '100%',
            h: 0,
            line: { color: '#A9A9A9', width: 1 }
        });

        slide.addText(
            formatSlideToStart(slideToStart),
            { x: "5%", y: "92%", h: 0.3, fontSize: 15, color: '#000000', w: "30%", fontFace: "Plus Jakarta Sans SemiBold", valign: "center" }
        );

        // slide.addText(
        //     footer.company,
        //     { x: "55%", y: "92%", h: 0.3, fontSize: 15, color: '#000000', w: "40%", fontFace: "Plus Jakarta Sans SemiBold", valign: "center", align: "right" }
        // );
    } catch (error) {
        console.log('Error: ', error);
    }

}

function BulletPointDefaultFrontPageWithoutImage(pptx, title, subtitle) {
    try {
        const date = generateCurrentMonthAndYear();

        let slide1 = pptx.addSlide('MASTER_SLIDE');

        slide1.addImage({
            data: backgroundurl(),
            x: '0%',
            y: '0%',
            w: '100%',
            h: "100%",
        });

        slide1.addShape(pptx.shapes.LINE, {
            x: '0%',
            y: '90%',
            w: '100%',
            h: 0,
            line: { color: '#A9A9A9', width: 1 }
        });

        slide1.addImage({
            data: slide1imageUrl2(),
            x: '71%',
            y: '23%',
            w: '8%',
            h: "10%",
        });

        slide1.addImage({
            data: slide1imageUrl2(),
            x: '21%',
            y: '68%',
            w: '8%',
            h: "10%",
        });

        slide1.addImage({
            data: slide1imageUrl1(),
            x: '25%',
            y: '27%',
            w: '50%',
            h: "46%",
        });


        slide1.addText(
            title,
            { x: "30%", y: "47%", h: 0.3, fontSize: 35, color: '#17A33E', w: "40%", bold: true, fontFace: "Plus Jakarta Sans SemiBold", valign: "center", align: "center" }
        );

        slide1.addText(
            date,
            { x: "5%", y: "92%", h: 0.3, fontSize: 15, color: '#000000', w: "30%", fontFace: "Plus Jakarta Sans SemiBold", valign: "center" }
        );

        // slide1.addText(
        //     source,
        //     { x: "55%", y: "92%", h: 0.3, fontSize: 15, color: '#000000', w: "40%", fontFace: "Plus Jakarta Sans SemiBold", valign: "center", align: "right" }
        // );

    } catch (error) {
        console.log(`Error: `, error)
    }
}

export async function createPresenationFromDefaultBulletPoint(result, email, imageForEachSlide, disablePhtoGenerationText) {
    try {
        let pptx = new PptxGenJS();

        pptx.layout = 'LAYOUT_16x9';

        // First Page
        if (imageForEachSlide) {
            BulletPointDefaultFrontPage(pptx, result.presentationTitle, result.presentationSubtitle, result.imageSearch, disablePhtoGenerationText);
        } else {
            BulletPointDefaultFrontPageWithoutImage(pptx, result.presentationTitle, result.presentationSubtitle);
        }

        // Collect all slides titles
        let slideTitles = [];
        for (let i = 0; i < result.slides.length; i++) {
            slideTitles.push(result.slides[i].title);
        }

        // Agenda Page
        const totalPageCreated = BulletPointDefaultPPTAgendaPage(pptx, slideTitles);
        console.log("Total Page Created: ", totalPageCreated);

        let slideToStart = 1;
        for (let i = 0; i < result.slides.length; i++) {
            if (imageForEachSlide) {
                pptThirdPage(pptx, slideToStart, result.slides[i], disablePhtoGenerationText);
            } else {
                pptThirdPageWithoutImage(pptx, slideToStart, result.slides[i]);
            }
            slideToStart += 1;
        }

        let fileName = result.presentationTitle.replace(/[^a-zA-Z0-9]/g, '');
        let randomId = crypto.randomBytes(8).toString('hex');
        const tempFilePath = `./${fileName}${randomId}.pptx`;
        await pptx.writeFile(tempFilePath);

        let pptxFile = {
            filename: `${fileName}${randomId}.pptx`,
            path: tempFilePath
        }

        const pptFileInfo = await storePresentatonFile(pptxFile, email)

        return pptFileInfo;

    } catch (error) {
        console.log("Presentation Generation Error", error);
        logErrorToBugsnag({
            errorClass: "Pptxgenjs Error",
            message: `Error Message: ${error}`,
            stacktrace: "ppt_generation.js",
            errorCode: "500",
            user: {
                email: email
            },
            errorPath: {
                name: 'ppt_generation.js',
                functionName: 'createPresenationFromDefaultBulletPoint'
            }
        });
        return {
            success: true,
            url: null,
            pptId: null
        }
    }
}