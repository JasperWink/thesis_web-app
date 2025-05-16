
export const EFFECT_TYPES = {
    NONE: 0,
    OVERLAY: 1,
    BLUR: 2,
    DESATURATE: 3
};


const getDiminishStrength = (nutri_score, effectType) => {
    const strengthMap = {
        [EFFECT_TYPES.NONE]: {
            0: 0,
            1: 0,
            2: 0,
            3: 0,
            4: 0
        },
        [EFFECT_TYPES.OVERLAY]: {
            0: 0,
            1: 0.3,
            2: 0.5,
            3: 0.7,
            4: 0.9
        },
        [EFFECT_TYPES.BLUR]: {
            0: 0,
            1: 5,
            2: 10,
            3: 15,
            4: 20
        },
        [EFFECT_TYPES.DESATURATE]: {
            0: 0,
            1: 0.3,
            2: 0.6,
            3: 0.8,
            4: 1
        }
    };
    return strengthMap[effectType][nutri_score];
};

const applyOverlay = (bbox, ctx, opacity) => {
    const [x, y, w, h] = bbox;

    if (opacity > 0) {
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.fillRect(x, y, w, h);
    }
};

const applyBlur = (scaled_bbox, ctx, video, diminish_strength) => {

};

const applyDesaturation = (scaled_bbox, ctx, video, diminish_strength) => {

};

const applyOutline = (bbox, ctx, det) => {
    const [x, y, w, h] = bbox;
    ctx.fillStyle = 'red';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);

    // -------------------- CAN MAYBE GO IN FINAL VERSION --------------------
    ctx.fillStyle = 'green';
    ctx.font = '16px Arial';
    ctx.fillText(
        `${det.class} (${Math.round(det.confidence * 100)}%) (${det.nutri_score})`,
        x,
        y - 5
    );
};

export const diminishObject = (canvas, video, detections, diminishMethod,
                               diminishType, useOutline, nutriScoreBaseline) => {
    if (!canvas || !video) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // ----------------- DIT IS VOOR TESTEN, KAN WEG --------------------
    // console.log(diminishMethod, diminishType, useOutline, nutriScoreBaseline)
    // -----------------------------------------------------------------
    detections.forEach(det => {
        let nutri_score = det.nutri_score;

        // Threshold (Set nutri-score to either min or max)
        if (diminishMethod == 0) {
            nutri_score = nutri_score > nutriScoreBaseline ? 4 : 0;
        }

        const diminish_strength = getDiminishStrength(nutri_score, diminishType);

        switch(diminishType) {
            case EFFECT_TYPES.NONE:
                break;
            case EFFECT_TYPES.OVERLAY:
                applyOverlay(det.bbox, ctx, diminish_strength);
                break;
            case EFFECT_TYPES.BLUR:
                applyBlur(det.bbox, ctx, video, diminish_strength);
                break;
            case EFFECT_TYPES.DESATURATE:
                applyDesaturation(det.bbox, ctx, video, diminish_strength);
                break;
        }

        if (useOutline) {
            applyOutline(det.bbox, ctx, det)
        }
    });
};
