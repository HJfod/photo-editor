front.send("hello from front");

front.on("hello from back", msg => {

});

const html = document.getElementsByTagName('html')[0];
const global = {
	slideMin: 50,
	touchShort: 100,
	touchLong: 1000
}

function $CSS(v) {
    let g = (getComputedStyle(html).getPropertyValue(v)).replace('px', '');
    if (isNaN(g)) {
        return g;
    } else {
        return Number(g);
    }
}

function $E(id) {
	return document.querySelector(id);
}

function convertToCSSVal(css, shrinkByPad = false) {
	css = css.replace(/--[a-z](-[a-z]+)*/g, s => `var(${s})`);
	if (shrinkByPad) css += " - var(--s-pad) * 2";
	if (/[\+\-\*\/]/.test(css.replace(/--[a-z](-[a-z]+)*/g, "")))
		return `calc(${css})`;
	return css;
}

class Panel extends HTMLElement {
    constructor () {
        super();
	}

	slide(s = null) {
		if (s != null ? s : this.show) {
			this.vertical ? this.style.top = this.showPos : this.style.left = this.showPos;
			this.show = 0;
			if (!this.hasAttribute("offset")) this.style.boxShadow = "0px 0px var(--s-shadow) var(--c-shadow)";
		} else {
			this.vertical ? this.style.top = this.hiddenPos : this.style.left = this.hiddenPos;
			this.show = 1;
			if (!this.hasAttribute("offset")) this.style.boxShadow = "none";
		}
	}

    connectedCallback() {
        if (this.hasAttribute("s")) {
            this.style.width  = convertToCSSVal(this.getAttribute("s").split("::")[0], !this.hasAttribute("c"));
            this.style.height = convertToCSSVal(this.getAttribute("s").split("::")[1], !this.hasAttribute("c"));
		}

		if (this.hasAttribute("sw")) {
			const dir = JSON.parse(this.getAttribute("sw"));
			this.startPoint = { x: null, y: null };
			this.scaleDist = null;
			this.scaleSize = { w: null, h: null };
			this.touchTime = 0;
			this.significantMove = false;

			this.addEventListener("touchstart", e => {
				this.touchTime = new Date().getTime();
				if (e.touches.length == 1)
					this.startPoint = { x: e.touches[0].pageX, y: e.touches[0].pageY };
				else if (e.touches.length == 2)
					this.scaleDist = Math.hypot(
						e.touches[0].pageX - e.touches[1].pageX,
						e.touches[0].pageY - e.touches[1].pageY
					);
					this.scaleSize = { w: dir.sc.style.width, h: dir.sc.style.height };
			});

			this.addEventListener("touchend",   e => {
				const touchLength = new Date().getTime() - this.touchTime;
				if (touchLength < global.touchShort && !this.significantMove) {
					$E("m-fade").style.opacity = "0";
					if (dir.r) $E(dir.r).slide(false);
					if (dir.l) $E(dir.l).slide(false);
					if (dir.u) $E(dir.u).slide(false);
					if (dir.d) $E(dir.d).slide(false);
				}
				this.significantMove = false;
				this.startPoint = { x: null,      y: null    };
				this.scaleSize = { w: null, h: null };
				this.scaleDist = null;
			});

			this.addEventListener("touchmove", e => {
				if (e.touches.length == 1) {
					if (this.startPoint.x == null) return;
					let disX = this.startPoint.x - e.touches[0].pageX;
					let disY = this.startPoint.y - e.touches[0].pageY;
					
					if (this.significantMove)
						$E("m-fade").style.opacity = "var(--fade)";
					if (Math.abs(disX) > Math.abs(disY)) {
						if (disX > global.slideMin || disX < -global.slideMin) {
							if (dir.r) $E(dir.r).slide(disX > 0);
							if (dir.l) $E(dir.l).slide(disX < 0);
							this.significantMove = true;
						}
					} else {
						if (disY > global.slideMin || disY < -global.slideMin) {
							if (dir.d) $E(dir.d).slide(disY > 0);
							if (dir.u) $E(dir.u).slide(disY < 0);
							this.significantMove = true;
						}
					
					}
				} else if (e.touches.length == 2) {
					const dist = Math.hypot(
						e.touches[0].pageX - e.touches[1].pageX,
						e.touches[0].pageY - e.touches[1].pageY
					);
					if (this.scaleDist - dist > 0) {
						dir.sc.style.width = this.scaleSize.w * this.scaleDist / dist;
					}
				}
			});
		}
		
		if (this.hasAttribute("bg"))
			this.style.background = convertToCSSVal(this.getAttribute("bg"));
		
		if (this.hasAttribute("fg"))
			this.style.color = convertToCSSVal(this.getAttribute("fg"));
		
		if (this.hasAttribute("side")) {
			const offset = this.hasAttribute("offset") ? this.getAttribute("offset") : 0;
			if (offset) this.style.boxShadow = "0px 0px var(--s-shadow) var(--c-shadow)";
			this.classList.add("side-panel");
			this.show = 0;
			this.style.transition = "none";
			this.offsetHeight;
			switch (this.getAttribute("side")) {
				case "left":
					this.hiddenPos = `-${this.offsetWidth - offset}px`;
					this.style.left = this.hiddenPos;
					this.showPos = "0px";
					break;
				case "right":
					this.hiddenPos = `${window.innerWidth - offset}px`;
					this.style.left = this.hiddenPos;
					this.showPos = `${window.innerWidth - this.offsetWidth}px`;
					break;
				case "top":
					this.hiddenPos = `-${this.offsetHeight - offset}px`;
					this.style.top = this.hiddenPos;
					this.showPos = `0px`;
					this.vertical = true;
					break;
				case "down":
					this.hiddenPos = `${window.innerHeight - offset}px`;
					this.style.top = this.hiddenPos;
					this.showPos = `${window.innerHeight - this.offsetHeight}px`;
					this.vertical = true;
					break;
			}
			this.offsetHeight;
			this.style.transition = "";
		}
    }
}

class Text extends HTMLElement {
    constructor () {
        super();
	}

    connectedCallback() {
		if (this.hasAttribute("b"))
			this.style.fontWeight = "bold";
		if (this.hasAttribute("h"))
			this.style.fontFamily = "Head";
		if (this.hasAttribute("s"))
			this.style.fontSize = convertToCSSVal(this.getAttribute("s"));
    }
}

customElements.define('m-t', Text);
customElements.define('m-p', Panel);