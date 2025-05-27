
export const DIMINISH_EFFECT = {
    NONE: 0,
    OVERLAY: 1,
    BLUR: 2,
    DESATURATE: 3
};

export const DIMINISH_METHODS = {
    THRESHOLD: 0,
    DYNAMIC: 1
};

export const OUTLINE = {
    OFF: 0,
    HEALTHY: 1,
    ALL: 2
}

const getDiminishStrength = (nutri_score, effectType) => {
    const EFFECT_STRENGTH_MAP = {
        [DIMINISH_EFFECT.NONE]:        [0, 0, 0, 0, 0],
        [DIMINISH_EFFECT.OVERLAY]:     [0, 0.3, 0.5, 0.7, 0.9],
        [DIMINISH_EFFECT.BLUR]:        [0, 1, 5, 10, 20],
        [DIMINISH_EFFECT.DESATURATE]:  [0, 0.3, 0.6, 0.8, 1]
    };
    return EFFECT_STRENGTH_MAP[effectType][nutri_score];
};

const applyOverlay = (bbox, ctx, opacity) => {
    if (opacity <= 0) return

    const [x, y, w, h] = bbox;

    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.fillStyle = 'white';
    ctx.fillRect(x, y, w, h);
    ctx.restore();
};

const applyBlur = (bbox, ctx, video, blurStrength) => {
    if (blurStrength <= 0) return;

    const [x, y, w, h] = bbox;

    // Target only the section of the canvas in the bbox.
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();

    // Draw the blur
    ctx.filter = `blur(${blurStrength}px)`;
    ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight, 
                  0, 0, ctx.canvas.width, ctx.canvas.height);
    
    ctx.restore();
};

const applyDesaturation = (bbox, ctx, video, desaturationStrength) => {
    if (desaturationStrength <= 0) return;

    const [x, y, w, h] = bbox;

    // Target only the section of the canvas in the bbox.
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();

    // Draw the desaturate effect.
    ctx.filter = `saturate(${1 - desaturationStrength})`;
    ctx.drawImage(video, x, y, w, h, x, y, w, h);
    
    ctx.restore();
};

const applyOutline = (bbox, ctx, det, outlineColor) => {
    const [x, y, w, h] = bbox;
    ctx.strokeStyle = outlineColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);

    // // -------------------- CAN MAYBE GO IN FINAL VERSION --------------------
    // ctx.fillStyle = 'green';
    // ctx.font = '16px Arial';
    // ctx.fillText(
    //     `${det.class} (${Math.round(det.confidence * 100)}%) (${det.nutri_score})`,
    //     x,
    //     y - 5
    // );
};

export const diminishObject = (canvas, video, detections, diminishMethod,
                               diminishType, nutriScoreBaseline, useOutline,
                               outlineColor) => {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    detections.forEach(det => {
        let nutri_score = det.nutri_score;

        // Threshold (Set nutri-score to either min or max).
        if (diminishMethod == DIMINISH_METHODS.THRESHOLD) {
            nutri_score = nutri_score > nutriScoreBaseline ? 4 : 0
        }

        // Set outline on healthy products, nutri-score of A or above baseline.
        if (useOutline == OUTLINE.HEALTHY && nutri_score == 0) {
            applyOutline(det.bbox, ctx, det, outlineColor);
        }

        const diminish_strength = getDiminishStrength(nutri_score, diminishType);

        switch(diminishType) {
            case DIMINISH_EFFECT.NONE:
                break;
            case DIMINISH_EFFECT.OVERLAY:
                applyOverlay(det.bbox, ctx, diminish_strength);
                break;
            case DIMINISH_EFFECT.BLUR:
                applyBlur(det.bbox, ctx, video, diminish_strength);
                break;
            case DIMINISH_EFFECT.DESATURATE:
                applyDesaturation(det.bbox, ctx, video, diminish_strength);
                break;
        }
        if (useOutline == OUTLINE.ALL) {
            applyOutline(det.bbox, ctx, det, outlineColor);
        }
    });
};
