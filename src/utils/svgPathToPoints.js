export function svgPathToPointsArray(svgPathData) {
    const commands = svgPathData.match(/[a-df-zA-DF-Z][^a-df-zA-DF-Z]*/g);
    const pointsArray = [];

    commands.forEach(command => {
        const cmd = command.trim()[0];
        const coords = command.trim().slice(1).trim().split(/\s*,\s*|\s+/).map(parseFloat);

        switch (cmd) {
            case 'M':
            case 'L':
                pointsArray.push([coords[0], coords[1]]);
                break;
            case 'H':
                pointsArray.push([coords[0], pointsArray[pointsArray.length - 1][1]]);
                break;
            case 'V':
                pointsArray.push([pointsArray[pointsArray.length - 1][0], coords[0]]);
                break;
            case 'Q':
                for (let i = 0; i < coords.length; i += 4) {
                    pointsArray.push([coords[i + 2], coords[i + 3]]);
                }
                break;
            case 'T':
                const prevPoint = pointsArray[pointsArray.length - 1];
                const cpX = 2 * prevPoint[0] - pointsArray[pointsArray.length - 2][0];
                const cpY = 2 * prevPoint[1] - pointsArray[pointsArray.length - 2][1];
                for (let i = 0; i < coords.length; i += 2) {
                    const x = coords[i];
                    const y = coords[i + 1];
                    pointsArray.push([cpX, cpY]);
                    pointsArray.push([x, y]);
                }
                break;
            // You can add support for other commands like C, A, etc. if needed
            default:
                break;
        }
    });

    return pointsArray;
}
