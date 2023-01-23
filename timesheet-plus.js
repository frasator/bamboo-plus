class TimesheetPlus {
    addStyle() {
        const style = document.createElement('style');
        style.textContent = `

        .full { position: relative; width: 100%; height: 100%; display: block; }
        .flex { flex: 1; flex-basis: 0.000000001px; }
        .d-flex { display: flex; overflow-wrap:break-word; }
        .d-iflex { display: inline-flex; }
        .fd-c { flex-direction: column; }
        .fd-rr { flex-direction: row-reverse; }
        .fd-cr { flex-direction: column-reverse; }
        .fw-w { flex-wrap: wrap }
        .fw-wr { flex-wrap: wrap-reverse }
        .jc-fe { justify-content: flex-end; }
        .jc-c { justify-content: center; }
        .jc-sb { justify-content: space-between; }
        .jc-sa { justify-content: space-around; }
        .jc-se { justify-content: space-evenly; }
        .ai-s{ align-items: stretch; }
        .ai-c{ align-items: center; }
        .ai-fs{ align-items: flex-start; }
        .ai-fe{ align-items: flex-end; }
        .ai-b{ align-items: baseline; }
        .ac-fs{ align-content: flex-start; }
        .ac-fe{ align-content:flex-end; }
        .ac-c{ align-content: center; }
        .ac-sb{ align-content: space-between; }
        .ac-sa{ align-content: space-around; }
        
        /* Break word fix */
        .d-flex > * { min-width: 0px; min-height:0px; }
        
        /**/
        .pntr{
            cursor: pointer;
        }
        .boton{
            width :170px;
            height :40px;
            cursor :pointer;
            font-size :1.2em;
            color :white;
            text-align :center;
            padding :9px 0
        }
        .boton-rojo{
            background-color :#CC3333;
        }
        .boton-azul{
            background-color :#003e63;
        }
        
        .hr{
            height:1px;
            background-color:lightgray;
            margin:10px 0
        }
        .br{
            height:1px;
            background-color:transparent;
            margin:10px 0
        }
        
        .b{
            font-weight: bold;
        }
        .i{
            font-style: italic;
        }
        
        .gris{
            color:gray;
        }
        .azul{
            color:#039BE5;
        }
        .verde{
            color:#2aa22e;
        }
        .morado{
            color:#903b9f;
        }
        .rojo{
            color:#CC3333;
        }
        .naranja{
            color:#FF6600;
        }
        
        .titulo1{
            padding:3px 5px;
            background-color: #f0f0f0;
            border-radius: 3px;
            font-size: 1.05em;
        }
        .contenido1{
            padding:3px 6px;
        }
        
        .shadow1{
            box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
        }
        
        .fs120{
            font-size: 1.2em;
        }
        
        .fs110{
            font-size: 1.1em;
        }
        
        .fs100{
            font-size: 1em;
        }
        
        .fs90{
            font-size: 0.9em;
        }
        .fs80{
            font-size: 0.8em;
        }
        .fs70{
            font-size: 0.7em;
        }
        
        `
        document.head.append(style);
    }
    constructor() {
        this.addStyle()
        this.meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
        this.minutosJornada = 465
        console.log("Hola")
        setInterval(async () => {
            const parent = this.getMain()
            if (parent == null) {
            } else {
                const left = parent.querySelector('#TimesheetPlus')
                if (left == null) {
                    this.init(parent)
                }
            }
        }, 5000)
    }
    getMain() {
        return document.querySelector('.wx-timesheet__main-body')
    }
    init(parent) {
        this.PROCESSING = false
        const left = document.createElement('div')
        left.setAttribute('id', 'TimesheetPlus')
        left.classList.add('shadow1')
        left.style.position = 'fixed'
        left.style.left = '15px'
        left.style.backgroundColor = '#fafafa'
        left.style.borderRadius = '3px'
        left.style.padding = '10px'
        left.style.fontSize = '1.2em'

        const bar = document.createElement('div')
        bar.classList.add('d-flex', 'ai-c')
        left.appendChild(bar)

        this.createClockInButton(parent, bar)
        this.createClockOutButton(parent, bar)

        setInterval(() => {
            this.renderHoy(left)
            this.renderMesHastaHoy(left)
        }, 1000)

        parent.insertBefore(left, parent.firstChild)

    }
    createClockInButton(parent, left) {
        const button = document.createElement('div')
        button.style.marginRight = '5px'
        button.classList.add('boton', 'boton-azul')
        button.innerHTML = '&#9654; Clock In'

        button.addEventListener('click', async () => {
            if (this.PROCESSING === false) {
                this.PROCESSING = true
                const dateNow = new Date()
                const daySelector = this.getSelectorHoy()
                let dayTitle = parent.querySelector(daySelector)
                const day = dayTitle.parentNode
                console.log(day)
                const dayRect = day.getBoundingClientRect()
                document.body.scrollTo(0, dayRect.top + document.body.scrollTop - 110)
                let isExpanded = dayTitle.getAttribute('aria-expanded') === 'true'
                if (!isExpanded) {
                    dayTitle.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
                }

                await new Promise(r => setTimeout(r, 500))

                let startEndEditors = day.querySelectorAll('timesheet-start-end-editor')
                let lastEditor = startEndEditors[startEndEditors.length - 1]
                const inputs = lastEditor.querySelectorAll('.wx-time-input')
                const startInput = inputs[0]
                const endInput = inputs[1]

                const startValues = this.getInputValue(startInput, dateNow)
                if (isNaN(startValues.hours)) {
                    const now = new Date()
                    const now2 = new Date(now.getTime() + 5 * 60000)
                    const startDate = this.adjustClockinTime(now, true)
                    const endDate = this.adjustClockinTime(now2, false)

                    await this.setInputTime(startInput, startDate)
                    await this.setInputTime(endInput, endDate)
                } else {
                    const endValues = this.getInputValue(endInput, dateNow)

                    // si es más de 10 minutos es un clockout real
                    const TEN_MINUTES = 10 * 60 * 1000;
                    if (endValues.date.getTime() - startValues.date.getTime() > TEN_MINUTES) {
                        await this.addNewStartEndEditor(daySelector)

                        const startEndEditors = day.querySelectorAll('timesheet-start-end-editor')
                        const lastEditor = startEndEditors[startEndEditors.length - 1]
                        const inputs = lastEditor.querySelectorAll('.wx-time-input')
                        const startInput = inputs[0]
                        const endInput = inputs[1]
                        const now = new Date()
                        const now2 = new Date(now.getTime() + 5 * 60000)
                        const startDate = this.adjustClockinTime(now, true)
                        const endDate = this.adjustClockinTime(now2, false)

                        await this.setInputTime(startInput, startDate)
                        await this.setInputTime(endInput, endDate)

                    }
                    // if (isNaN(startValues.hours)) {
                    // 
                    // }
                }

                await this.saveDay(daySelector)

                this.PROCESSING = false

            }
        })

        left.appendChild(button)
    }

    createClockOutButton(parent, left) {
        const button = document.createElement('div')
        button.classList.add('boton', 'boton-rojo')
        button.innerHTML = '&#9724; Clock out'

        button.addEventListener('click', async () => {
            if (this.PROCESSING === false) {
                this.PROCESSING = true
                const dateNow = new Date()
                const daySelector = this.getSelectorHoy()
                let dayTitle = parent.querySelector(daySelector)
                const day = dayTitle.parentNode
                console.log(day)
                const dayRect = day.getBoundingClientRect()
                document.body.scrollTo(0, dayRect.top + document.body.scrollTop - 110)
                let isExpanded = dayTitle.getAttribute('aria-expanded') === 'true'
                if (!isExpanded) {
                    dayTitle.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
                }

                await new Promise(r => setTimeout(r, 500))

                const startEndEditors = day.querySelectorAll('timesheet-start-end-editor')
                const lastEditor = startEndEditors[startEndEditors.length - 1]
                const inputs = lastEditor.querySelectorAll('.wx-time-input')
                const startInput = inputs[0]
                const endInput = inputs[1]

                const startValues = this.getInputValue(startInput, dateNow)
                const endValues = this.getInputValue(endInput, dateNow)

                const TEN_MINUTES = 10 * 60 * 1000;
                if (endValues.date.getTime() - startValues.date.getTime() == TEN_MINUTES) {
                    const now2 = new Date(new Date().getTime() + 5 * 60000)
                    const endDate = this.adjustClockinTime(now2, false)
                    await this.setInputTime(endInput, endDate)

                    await this.saveDay(daySelector)
                }

                this.PROCESSING = false

            }
        })

        left.appendChild(button)
    }

    async setInputTime(timeInput, now) {
        const hours = now.getHours()
        const minutes = now.getMinutes()

        const startHoursInput = timeInput.querySelector('.wx-time-input__hours')
        const startMinutesInput = timeInput.querySelector('.wx-time-input__minutes')

        const upStartArrow = timeInput.querySelector('.wx-time-input__up-arrow')
        const downStartArrow = timeInput.querySelector('.wx-time-input__down-arrow')

        startHoursInput.dispatchEvent(new Event('focus', { bubbles: true }))
        await new Promise(r => setTimeout(r, 100))
        startHoursInput.dispatchEvent(new Event('click', { bubbles: true }))
        await new Promise(r => setTimeout(r, 100))

        while (true) {
            let current = startHoursInput.innerText
            if (parseInt(current) === parseInt(hours)) {
                break
            } else {
                upStartArrow.dispatchEvent(new Event('click', { bubbles: true }))
                await new Promise(r => setTimeout(r, 20))
            }
        }

        startMinutesInput.dispatchEvent(new Event('focus', { bubbles: true }))
        await new Promise(r => setTimeout(r, 100))
        startMinutesInput.dispatchEvent(new Event('click', { bubbles: true }))
        await new Promise(r => setTimeout(r, 100))


        while (true) {
            let current = startMinutesInput.innerText
            if (parseInt(current) === parseInt(minutes)) {
                break
            } else {
                upStartArrow.dispatchEvent(new Event('click', { bubbles: true }))
                await new Promise(r => setTimeout(r, 20))
            }
        }
    }
    getInputValue(timeInput, date) {
        const startHoursInput = timeInput.querySelector('.wx-time-input__hours')
        const startMinutesInput = timeInput.querySelector('.wx-time-input__minutes')
        const hours = parseInt(startHoursInput.innerText)
        const minutes = parseInt(startMinutesInput.innerText)

        if (!isNaN(hours) && !isNaN(minutes)) {
            date = new Date(date)
            date.setHours(hours)
            date.setMinutes(minutes)
        } else {
            date = null
        }
        return { hours: hours, minutes: minutes, date: date }
    }


    async saveDay(daySelector) {
        const parent = document.querySelector('.wx-timesheet__main-body')
        const dayTitle = parent.querySelector(daySelector)
        let isExpanded = dayTitle.getAttribute('aria-expanded') === 'true'
        if (isExpanded) {
            await new Promise(r => setTimeout(r, 100))
            dayTitle.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
        }
        await new Promise(r => setTimeout(r, 100))
        dayTitle.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
        await new Promise(r => setTimeout(r, 100))
    }

    async addNewStartEndEditor(daySelector) {
        const parent = document.querySelector('.wx-timesheet__main-body')
        const dayTitle = parent.querySelector(daySelector)
        const day = dayTitle.parentNode
        const startEndEditors = day.querySelectorAll('timesheet-start-end-editor')
        const lastEditor = startEndEditors[startEndEditors.length - 1]
        const addButton = lastEditor.querySelector(`button[aria-label="Add"]`)

        addButton.dispatchEvent(new Event('click', { bubbles: true }))
        await new Promise(r => setTimeout(r, 100))
    }

    adjustClockinTime(date, is_clockin = true) {
        date = new Date(date)

        let new_minutes
        if (is_clockin) {
            // date.getTime() + minutes*60000
            new_minutes = Math.floor(date.getMinutes() / 5) * 5
        } else {
            new_minutes = Math.ceil(date.getMinutes() / 5) * 5
        }

        if (new_minutes == 60) {
            date.setHours(date.getHours() + 1)
            date.setMinutes(0)
        } else {
            date.setMinutes(new_minutes)
        }

        return date
    }
    ////////////////////////////
    ////////////////////////////
    ////////////////////////////
    ////////////////////////////
    ////////////////////////////
    ////////////////////////////
    ////////////////////////////
    mostarDia() {
        const dayTitle = this.getMain().querySelector(this.getSelectorHoy())
        const day = dayTitle.parentNode
        const dayRect = day.getBoundingClientRect()
        document.body.scrollTo(0, dayRect.top + document.body.scrollTop - 110)
        let isExpanded = dayTitle.getAttribute('aria-expanded') === 'true'
        if (!isExpanded) {
            dayTitle.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
        }
    }

    renderMinutos(minutos) {
        let horas = Math.abs(Math.trunc(minutos / 60))
        let mins = Math.abs(minutos % 60)
        return `${horas}h ${mins}m`
    }

    getSelectorHoy() {
        const dateNow = new Date()
        const year = dateNow.getFullYear()
        const month = ('00' + dateNow.getMonth() + 1).slice(-2)
        const monthDay = ('00' + dateNow.getDate()).slice(-2)
        return `timesheet-day > [id="timesheet-day-${year}-${month}-${monthDay}"]`
    }

    getTiempoTrabajadoHoy() {
        const dayTitle = this.getMain().querySelector(this.getSelectorHoy())
        const daySummary = dayTitle.querySelector('.wx-timesheet-day__summary')
        const text = daySummary.innerText
        const split = text.split('h')

        const hours = parseInt(split[0].trim())
        const minutes = parseInt(split[1].trim().split('m')[0].trim())

        return { horas: hours, minutos: minutes }
    }
    getTiempoTrabajadoMes() {
        const summary = this.getMain().querySelector('.wx-timesheet-overview-details__summary-hours')
        const text = summary.innerText
        const split = text.split('h')

        const hours = parseInt(split[0].trim())
        const minutes = parseInt(split[1].trim().split('m')[0].trim())

        return { horas: hours, minutos: minutes }
    }
    getDiasTrabajoMes() {
        const dayTitles = this.getMain().querySelectorAll('.wx-timesheet-day__header-weekday')
        const todayTitle = this.getMain().querySelector(this.getSelectorHoy())
        let contadorDias = 0
        let posicionHoy = -1
        for (let i = 0; i < dayTitles.length; i++) {
            const dayTitle = dayTitles[i];
            const dayIndicators = dayTitle.querySelector('.wx-timesheet-day__indicators')
            if (dayIndicators.children.length === 0) {
                contadorDias++
            }
            if (dayTitle === todayTitle) {
                posicionHoy = i
            }
        }
        return { posicionHoy: posicionHoy, total: contadorDias }
    }

    renderHoy(parent) {
        let hoyEl = parent.querySelector('#hoy')
        if (hoyEl == null) {
            hoyEl = document.createElement('div')
            hoyEl.setAttribute('id', 'hoy')
            parent.appendChild(hoyEl)
        }
        const t = this.getTiempoTrabajadoHoy()

        // const handleAbrirDia = ()=>{

        // }

        hoyEl.innerHTML = `
            <div class="br"></div>
            <div class="titulo1 d-flex jc-sb">
                <div class="i">Hoy</div>
                <div id="verHoy" class="pntr azul n">&#x27A1; &nbsp;</div>
            </div>
            <div class="contenido1">
            <span class="verde b"> ${t.horas}h ${t.minutos}m  </span>
            <span class=""> de </span>
            <span class="b"> ${this.renderMinutos(this.minutosJornada)} </span>
            </div>
        `
        const flecha = hoyEl.querySelector('#verHoy')
        flecha.addEventListener('click', () => {
            this.mostarDia()
        })
    }
    renderMesHastaHoy(parent) {
        let mesEl = parent.querySelector('#mes')
        if (mesEl == null) {
            mesEl = document.createElement('div')
            mesEl.setAttribute('id', 'mes')
            parent.appendChild(mesEl)
        }
        const t = this.getTiempoTrabajadoMes()
        const dat = this.getDiasTrabajoMes()
        const mj = this.minutosJornada

        const minutosRestantes = (mj * dat.posicionHoy) - (t.horas * 60 + t.minutos)
        let txtRestantes = '', colorRestantes = ''
        if (minutosRestantes > 0) {
            colorRestantes = 'naranja'
            txtRestantes = 'restantes'
        } else {
            colorRestantes = 'rojo'
            txtRestantes = 'de más'
        }
        mesEl.innerHTML = `
            <div class="br"></div>
            <div class="titulo1 d-flex jc-sb">
                <div class="i">Este mes hasta hoy</div>
            </div>
            <div class="contenido1">
                <div class=" "> 
                    <span class="b morado"> ${dat.posicionHoy}º día </span> de 
                    <span class="b"> ${dat.total} </span> 
                    laborables
                </div>
                <div class=" "> 
                    <span class="verde b"> ${this.renderMinutos(t.horas * 60 + t.minutos)}</span>
                    <span class=""> de </span>
                    <span class="b"> ${this.renderMinutos(mj * dat.posicionHoy)}</span>
                    <span class="gris fs80"> ${dat.posicionHoy} x ${this.renderMinutos(mj)}</span> 
                </div>
                <div class=" ">
                    <span class="${colorRestantes} b"> ${this.renderMinutos(minutosRestantes)}</span> ${txtRestantes}
                </div>
            </div>
        `
    }
}
new TimesheetPlus()
