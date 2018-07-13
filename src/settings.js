const settings = {
	borderColor: '#272626',
	fps: 50,
	then: Date.now(),
	speed: [4000, 3000, 2000],
	padding: document.documentElement.clientWidth < 400 || document.documentElement.clientHeight < 800 ? 80 : 150,
	colors: ['#00E3AD', '#00DFB1', '#00D6BD', '#00D0C5', '#00CCC8', '#00C9CC', '#00C6D0', '#00C0D9', '#00BBDD', '#00B5E4'],
	level: Number(localStorage.getItem('level')) || 1,
	interval() {
		return settings.speed[this.level] / settings.fps
	},
	unit: Number(localStorage.getItem('unit')) || 30
};

export default settings;
