var main = (mensaje) => {
    var timePrint = (minutos) => {
        return `${Math.trunc(minutos / 60)}h ${Math.abs(minutos % 60)}m`
    }
    var timePrintNegative = (minutos) => {
        let stl = `color:#e53935;`
        let res = `${Math.trunc(minutos / 60)}h ${Math.abs(minutos % 60)}m`
        if(minutos < 0){
            return `<i style="${stl}">${res}</i>`
        }else{
            return res
        }
    }
    var calcMinutosTrabajo = (dias, mediosDias) => {
        return (dias * ((60 * 7) + 45)) + (mediosDias * 4 * 60)
    }
    var parseTimeText = (el) => {
        let textTime = el.querySelector('.TimesheetSlat__dayTotal').innerText
        let parsedHours = parseInt(textTime.split('h')[0])
        let parsedMinutes = parseInt(textTime.split(' ')[1].split('m')[0])
        return { hours: parsedHours, minutes: parsedMinutes }
    }

    calcularMinutosATrabajar = (els) => {
        var minutosTrabajados = 0;
        var diasATrabajar = 0
        var mediosDiasATrabajar = 0
        var minutosMedicalAppointments = 0
        var diasOtros = 0
        for (var i = 0; i < els.length; i++) {
            let el = els[i]
            const dayName = el.querySelector('.TimesheetSlat__dayOfWeek').innerText.toLowerCase()
            const dayDate = el.querySelector('.TimesheetSlat__dayDate').innerText.toLowerCase()

            /* Trabajados */
            let parsed_a = parseTimeText(el)
            minutosTrabajados += parsed_a.hours * 60
            minutosTrabajados += parsed_a.minutes

            /* A trabajar */
            if (dayName != "sat" && dayName != "sun" && dayName != "sáb" && dayName != "dom") {
                let extra = el.querySelector('.TimesheetSlat__extraInfoItem--clockPush')
                if (extra == null) {
                    diasATrabajar++
                } else {
                    if (extra.innerText.indexOf('0.5 days Holidays') != -1
                        || extra.innerText.indexOf('0.5 days Additional Days Off') != -1) {
                        diasOtros += 0.5
                        mediosDiasATrabajar += 1
                    } else if (extra.innerText.indexOf('hours Medical Appointments') != -1) {
                        let parsed = parseTimeText(el)
                        minutosMedicalAppointments += parsed.hours * 60
                        minutosMedicalAppointments += parsed.minutes
                    } else {
                        diasOtros++
                    }
                    // Private Leave
                    // Compensation:
                    // Holydays
                    // Business Trips
                }
            }
        }
        var minutosATrabajar = calcMinutosTrabajo(diasATrabajar, mediosDiasATrabajar)
        minutosATrabajar += minutosMedicalAppointments

        return {
            minutosATrabajar: minutosATrabajar,
            minutosTrabajados: minutosTrabajados,
            diasOtros: diasOtros,
            diasATrabajar: diasATrabajar,
            mediosDiasATrabajar: mediosDiasATrabajar
        }

    }

    var aux1 = document.querySelector('.TimesheetEntries')
    var diasMesConFinde = aux1.querySelectorAll('.TimesheetSlat:not(.TimesheetSlat--disabled)')
    var diasMesSinFinde = aux1.querySelectorAll('.TimesheetSlat:not(.TimesheetSlat--disabled):not(.js-timesheet-showWeekends)')


    var hoyEl = aux1.querySelector('.TimesheetSlat--today')
    var diasHastaHoy = []
    for (var i = 0; i < diasMesConFinde.length; i++) {
        let el = diasMesConFinde[i]
        diasHastaHoy.push(el)
        if (el == hoyEl) {
            break
        }
    }
    // var weeks = []
    // var weekNum = 0
    // for (var i = 0; i < diasMesConFinde.length; i++) {
    //     let el = diasMesConFinde[i]
    //     const dayName = el.querySelector('.TimesheetSlat__dayOfWeek').innerText
    //     const dayDate = el.querySelector('.TimesheetSlat__dayDate').innerText

    //     if (weeks[weekNum] == null) {
    //         weeks[weekNum] = []
    //     }
    //     if (dayName == "Mon") {
    //         if (weeks[weekNum].length == 0) {
    //             weeks[weekNum].push(el)
    //         } else {
    //             weekNum += 1
    //             weeks[weekNum] = []
    //             weeks[weekNum].push(el)
    //         }
    //     } else {
    //         weeks[weekNum].push(el)
    //     }
    // }

    /* Mes */
    var mes = calcularMinutosATrabajar(diasMesConFinde)


    /* Hoy */
    var parsedHoy
    if (hoyEl) {
        parsedHoy = parseTimeText(hoyEl)
    }


    /* HTML */
    var imgEl = document.querySelector('.TimesheetSummary__photo')
    var div = document.querySelector('#infoextra')
    if (!div) {
        div = document.createElement('div')
        div.style.marginBottom = '20px'
        div.style.padding = '0'
        div.style.textAlign = 'left'
        div.id = 'infoextra'
        imgEl.parentNode.insertBefore(div, imgEl)
    }

    let ks = `display:inline-block;color:#666;`
    let vs = `font-family:'BhrHeaderFont', 'Trebuchet MS';display:inline-block;`
    let vs1 = `${vs}width:26px;color:#BA68C8;font-size:18px;`
    let vs2 = `${vs}color:#4CAF50;font-size:18px`
    let vs3 = `${vs}width:26px;color:#EC407A;font-size:18px`
    let vs4 = `${vs}color:#039BE5;font-size:18px`
    let vs5 = `${vs}color:#FF6F00;font-size:18px`
    let vs6 = `${vs}color:#888;font-size:16px`
    let vs7 = `${vs}color:#4CAF50;font-size:20px`

    var hoyHTML = ``
    if (parsedHoy != null) {
        hoyHTML = `
        <span style="${ks}">Hoy</span>
        &nbsp; &nbsp; 
		<span style="${vs7}">${parsedHoy.hours}h ${parsedHoy.minutes}m</span>
        ${((parsedHoy.hours * 60) + parsedHoy.minutes >= 465) ? `<br><span style="${vs6}">${mensaje}</span>` : ''}
        <div style="height:1px;background-color:lightgray;margin:10px 0"></div>
		`
    }

    var hastaHoy = calcularMinutosATrabajar(diasHastaHoy)

    div.innerHTML = `
        ${hoyHTML}

        <span style="${ks}">Hasta hoy</span>
        <br>
        <span style="${vs2}">${timePrint(hastaHoy.minutosTrabajados)}</span>
        <span style="${ks}">&nbsp; de &nbsp;</span>
        <span style="${vs4}">${timePrint(hastaHoy.minutosATrabajar)}</span>
        <br>
        <span style="${vs5}">${timePrintNegative(hastaHoy.minutosATrabajar - hastaHoy.minutosTrabajados)}</span>
        <span style="${ks}"> para irte hoy </span>

        <div style="height:1px;background-color:lightgray;margin:10px 0"></div>

        <span style="${ks}">Este mes</span>
        <br>
        <span style="${vs2}">${timePrint(mes.minutosTrabajados)}</span>
        <span style="${ks}">&nbsp; de &nbsp;</span>
        <span style="${vs4}">${timePrint(mes.minutosATrabajar)}</span>
        <br>
        <span style="${vs5}">${timePrintNegative(mes.minutosATrabajar - mes.minutosTrabajados)}</span>
        <span style="${ks}"> restantes este mes</span>

        <div style="height:1px;background-color:lightgray;margin:10px 0"></div>

        <span style="${vs1}">${mes.diasATrabajar + mes.mediosDiasATrabajar / 2}</span>
        &nbsp;
        <span style="${ks}">D&iacute;as de trabajo</span>
		<br>
        <span style="${vs3}">${mes.diasOtros}</span>
        &nbsp;
        <span style="${ks}">Otros d&iacute;as</span>

        <div style="height:1px;background-color:lightgray;margin:10px 0"></div>
        <br>
	`
}
var mensajesSubliminales = [
    'Vete a casa o te reviento!',
    'Qué haces aquí matat!',
    'Eres un puto loser!',
    'Cosas que hay que saber: vete a casa!',
    'Fuera de aquí, subnormal!',
    'Deja de regalar tu tiempo, inútil',
    'No le importas a nadie, vete de aquí!',
    'Quedas expulsado. Adiós!',
    'Llegas tarde a tu puta casa',
    'Asumimos que en tu casa no te quieren',
    'Eres libre, bienvenido a la irrealidad',
    'Sei una covarianza',
    'Fuera de aquí, retromónguer!',
    'Lárgate o recibirás el CD de los chistes de Quino. :D',
    'Di en alto  ♬ Pollo Pollo Polla ♬ y vete!'
]
var msLen = mensajesSubliminales.length
var getRandomInt = (min, max) => {
    return Math.floor(Math.random() * (max - min)) + min;
}

if (window.location.href.indexOf('employees/timesheet/?id=') != -1) {
    let mensajeIdx = getRandomInt(0, msLen - 1)
    let mensaje = mensajesSubliminales[mensajeIdx]
    main(mensaje)
    setInterval(() => { main(mensaje) }, 5000)
    document.querySelector('#contentTop').style.visibility = 'hidden'
    document.querySelector('#employeePhoto').style.visibility = 'hidden'
    document.querySelector('h1.logoImg').style.visibility = 'hidden'
}
