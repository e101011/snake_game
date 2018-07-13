import React from 'react';
import './Game.css';
import classNames from 'classnames';
import settings from './settings';

class Game extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			isSettingsOpen: false,
			isGameOver: false,
			score: 0,
			unit: Number(localStorage.getItem('unit')) || 30
		};

		this.food = {};
		this.snake = [{
			x: this.state.unit,
			y: this.state.unit
		}];

		[
			'requestAnimation',
			'detectDirection',
			'generateFoodPosition',
			'drawFood',
			'drawSnake',
			'detectCollision',
			'updateSnakePosition',
			'getCanvasSize',
			'resetCanvas',
			'changeLevel',
			'getSettings',
			'changeColor'
		].forEach(f => this[f] = this[f].bind(this));
	}

	componentDidMount() {
		window.addEventListener('keydown', this.updateSnakePosition);
		window.addEventListener('resize', () => this.resetCanvas());

		this.getCanvasSize();
		this.requestAnimation();
		!this.state.isGameOver && this.generateFoodPosition();
	}

	resetCanvas() {
		localStorage.setItem('unit', this.state.unit);

		this.setState({
			score: 0,
			isGameOver: false
		});

		this.direction = null;
		this.snake = [{
			x: this.state.unit,
			y: this.state.unit
		}];

		this.generateFoodPosition();
		this.getCanvasSize();
		window.requestAnimationFrame(this.requestAnimation);
		window.addEventListener('keydown', this.updateSnakePosition);
	}

	getColor(i) {
		if (this.state.activeColor === 'red') return '#F16658';

		const color = settings.colors;
		const index = Math.floor( i / (color.length - 1)) % 2 ?
			(color.length - i % ( color.length - 1) - 1) :
			i % (color.length - 1);

		return color[index];
	}

	detectDirection() {
		if (this.keyCode === 37 && this.direction !== 'right') this.direction = 'left';
		if (this.keyCode === 38 && this.direction !== 'bottom') this.direction = 'top';
		if (this.keyCode === 39 && this.direction !== 'left') this.direction = 'right';
		if (this.keyCode === 40 && this.direction !== 'top') this.direction = 'bottom';
	}

	detectCollision(head) {
		const collisionWithBorders = head.x === -this.state.unit || head.x === settings.canvasWidth || head.y === -this.state.unit || head.y === settings.canvasHeight;
		const collisionWithFood = head.x === this.food.x && head.y === this.food.y;
		const collisionWithTail = this.snake.length > 1 && this.snake.some(item => item.x === head.x && item.y === head.y);

		if (collisionWithBorders || collisionWithTail) {
			this.showModal();
			this.setState({ isGameOver: true });
		}

		if (collisionWithFood) {
			this.setState({
				score: this.state.score + 1
			});

			this.generateFoodPosition();
		}

		return collisionWithBorders || collisionWithFood || collisionWithTail;
	}

	generateFoodPosition() {
		const math = param => Math.floor(Math.random() * (param / this.state.unit)) * this.state.unit;
		do {
			this.food.x = math(settings.canvasWidth);
			this.food.y = math(settings.canvasHeight);
		} while (this.snake.some(item => item.x === this.food.x && item.y === this.food.y));

		this.drawFood();
	}

	drawFood() {
		this.refs.canvas.getContext('2d').fillStyle = this.getColor(this.snake.length);
		this.refs.canvas.getContext('2d').fillRect(this.food.x, this.food.y, this.state.unit, this.state.unit);
		this.refs.canvas.getContext('2d').lineWidth = 2;
		this.refs.canvas.getContext('2d').strokeStyle = settings.borderColor;
		this.refs.canvas.getContext('2d').strokeRect(this.food.x, this.food.y, this.state.unit, this.state.unit);
	}

	updateSnakePosition(e) {
		const { canvas } = this.refs;
		const keyCode = e && e.keyCode;
		const head = {...this.snake[0]};

		canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);

		if (keyCode) {
			this.keyCode = keyCode;
			this.detectDirection()
		}

		if (this.direction === 'left') head.x -= this.state.unit;
		if (this.direction === 'top') head.y -= this.state.unit;
		if (this.direction === 'right') head.x += this.state.unit;
		if (this.direction === 'bottom') head.y += this.state.unit;

		if (keyCode) {
			this.keyCode = keyCode;
		}

		!this.detectCollision(head) && this.snake.pop();

		this.snake.unshift(head);

		this.drawSnake();
		this.drawFood();
	}

	drawSnake() {
		this.snake.map((item, i) => {
			this.refs.canvas.getContext('2d').fillStyle = this.getColor(i);
			this.refs.canvas.getContext('2d').fillRect(item.x, item.y, this.state.unit, this.state.unit);
			this.refs.canvas.getContext('2d').lineWidth = 2;
			this.refs.canvas.getContext('2d').strokeStyle = settings.borderColor;
			this.refs.canvas.getContext('2d').strokeRect(item.x, item.y, this.state.unit, this.state.unit);
		});
	}

	requestAnimation() {
		if (this.state.isGameOver) {
			this.refs.canvas.getContext('2d').clearRect(0, 0, this.refs.canvas.width, this.refs.canvas.height);
			window.removeEventListener('keydown', this.updateSnakePosition);
			return;
		}

		const now = Date.now();
		const delta = now - settings.then;

		if (delta > settings.interval()) {
			settings.then = now - (delta % settings.interval());

			this.updateSnakePosition();
		}

		window.requestAnimationFrame(this.requestAnimation);
	}

	getCanvasSize() {
		const getInteger = size => size % this.state.unit !== 0 ? getInteger(size - 1) : size;

		this.refs.canvas.width = settings.canvasWidth = getInteger(document.documentElement.clientWidth - settings.padding);
		this.refs.canvas.height = settings.canvasHeight = getInteger(document.documentElement.clientHeight - settings.padding);
	}

	showModal() {
		this.setState({
			isGameOver: true
		});
	}

	changeLevel(e) {
		if (e.target.getAttribute('data-level')) {
			settings.level = e.target.getAttribute('data-level');

			[...e.currentTarget.children].map(item => {
				item.className === 'active' && item.classList.remove('active');
			});

			e.target.className !== 'active' && e.target.classList.add('active');

			localStorage.setItem('level', settings.level);

			this.resetCanvas(true);
		}
	}

	getSettings() {
		return (
			<div className="settings-block">
				<div className="close-button" onClick={() => this.setState({ isSettingsOpen: false })}/>
				<div className="item">
					<div className="title">Snake size:</div>
					<div className="snake-size">
										<span className="decrease" onClick={() => {
											if (this.state.unit === 15 ) return;
											this.setState({unit: this.state.unit - 5}, this.resetCanvas)}
										}/>
						<span className="size">{this.state.unit}</span>
						<span className="increase" onClick={() => this.setState({unit: this.state.unit + 5}, this.resetCanvas)}/>
					</div>
				</div>
				<div className="item">
					<div className="title">Level:</div>
					<ul ref="levels" onClick={this.changeLevel}>
						{
							settings.speed.map((item, i) => {
								return <li className={classNames({
									active: i === Number(settings.level)
								})} data-level={i} key={i}/>
							})
						}
					</ul>
				</div>
			</div>
		);
	}

	changeColor(e) {
		const { className } = e.target;
		className !== 'colors' && this.setState({ activeColor: className });
	}

	render() {
		return (
			<div className="snake-game">
				<canvas ref="canvas"/>
				<div className="settings" onClick={() => this.setState({ isSettingsOpen: true })}>Settings</div>

				{this.state.isSettingsOpen && this.getSettings()}
				<div className="score">{this.state.score}</div>
				{
					this.state.isGameOver && !this.state.isSettingsOpen && (
						<div className="game-over">
							<span>{this.state.score}</span>
							<div className="restart" onClick={this.resetCanvas}>restart</div>
						</div>
					)
				}
				<div className="colors" onClick={this.changeColor}>
					<div className="blue"/>
					<div className="red"/>
				</div>
			</div>
		);
	}
}

export default Game;
