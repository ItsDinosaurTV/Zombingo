export function rotateVector(point: { x: number; y: number }, angleInRadians: number) {
	if (angleInRadians === 0) return point;

	// Rotate the vector
	const rotatedX = point.x * Math.cos(angleInRadians) - point.y * Math.sin(angleInRadians);
	const rotatedY = point.x * Math.sin(angleInRadians) + point.y * Math.cos(angleInRadians);

	return { x: rotatedX, y: rotatedY };
}

export function randomInRange(min: number, max: number) {
	return Math.random() * (max - min) + min;
}

export function rotateAroundPoint(
	point: { x: number; y: number },
	center: { x: number; y: number },
	angleInRadians: number
) {
	if (angleInRadians === 0) return point;

	// Calculate the current position relative to the point
	const relativePosition = {
		x: point.x - center.x,
		y: point.y - center.y
	};

	// Rotate the relative position
	const rotatedPosition = rotateVector(relativePosition, angleInRadians);

	// Calculate the new absolute position, flipped
	const newPosition = {
		x: rotatedPosition.x + center.y,
		y: rotatedPosition.y + center.x
	};

	return newPosition;
}
