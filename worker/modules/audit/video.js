export function auditVideo(video = {}) {
	const available = Boolean(video.url || video.file || video.frames);

	return {
		available,
		status: available ? "ready_for_video_ai" : "unavailable",
		checks: {
			source: Boolean(video.url || video.file),
			frames: Boolean(video.frames),
			transcript: Boolean(video.transcript)
		},
		targets: [
			"hook",
			"first_3_seconds",
			"pacing",
			"on_screen_text",
			"cta",
			"retention"
		]
	};
}
