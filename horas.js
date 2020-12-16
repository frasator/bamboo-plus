class Bamboonomix {
  getMinutosJornada() {
    let mj = localStorage.getItem('minutosJornada')
    if (mj == null) {
      return 465
    } else {
      return parseInt(mj)
    }
  }
  constructor() {
    if (window.location.href.indexOf('employees/timesheet/?id=') != -1) {
      this.meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
      this.mensajesSubliminales = [
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
      var jsonNode = document.querySelector('#js-timesheet-data')
      var jsonData = JSON.parse(jsonNode.innerText)
      this.allTimeSheets = jsonData.employeeTimesheets
      this.timesheet = jsonData.timesheet
      localStorage.setItem('timesheets', JSON.stringify(this.allTimeSheets))
      localStorage.setItem(this.timesheet.id, JSON.stringify(this.timesheet))

      this.timesheetInfo = this.initTimesheetInfo()
      // this.timesheet.dailyDetails //dias

      for (let i = 0; i < this.allTimeSheets.length; i++) {
        const ts = this.allTimeSheets[i];
        console.log(ts.start, JSON.parse(localStorage.getItem(ts.id)))
      }

      console.log(' ')
      console.log(' ')
      console.log(' ')
      console.log(this.allTimeSheets)
      console.log(this.timesheet)
      console.log(this.timesheetInfo)

      this.start()
    }
  }
  start() {
    var msLen = this.mensajesSubliminales.length
    let mensajeIdx = this.getRandomInt(0, msLen - 1)
    let mensaje = this.mensajesSubliminales[mensajeIdx]
    this.pinta(mensaje)
    setInterval(() => { this.pinta(mensaje) }, 5000)
    document.querySelector('#employeePhoto').style.visibility = 'hidden'
    document.querySelector('.PageHeader__titleWrap').style.visibility = 'hidden'
  }
  initTimesheetInfo() {
    var timesheetInfo = {}
    for (let i = 0; i < this.allTimeSheets.length; i++) {
      let ts = this.allTimeSheets[i]
      if (ts.id == this.timesheet.id) {
        timesheetInfo = Object.assign(timesheetInfo, ts)
        break
      }
    }
    var aux = timesheetInfo.start.split('-')
    timesheetInfo.year = aux[0]
    timesheetInfo.month = aux[1]
    return timesheetInfo
  }
  getDayFromEl(el) {
    const dayDate = parseInt(el.querySelector('.TimesheetSlat__dayDate').innerText.toLowerCase().split(' ')[1])
    let cero = (dayDate < 10) ? '0' : ''
    const diaId = `${this.timesheetInfo.year}-${this.timesheetInfo.month}-${cero}${dayDate}`
    return this.timesheet.dailyDetails[diaId]
  }
  getMinutesFromHourNumber(hours) {
    var hrs = parseInt(Number(hours))
    var min = Math.round((Number(hours) - hrs) * 60)
    return (hrs * 60) + min
  }
  getMinutosGuardiaFromDia(dia, diaEl) {
    let minutos = 0
    let guardiaFlag = false
    for (let i = 0; i < dia.clockEntries.length; i++) {
      let clockEntry = dia.clockEntries[i]
      if (clockEntry.note != null && clockEntry.note.toLowerCase().trim().indexOf('guardia') != -1) {
        minutos += this.getMinutesFromHourNumber(clockEntry.hours)
        guardiaFlag = true
      }
    }
    if (guardiaFlag == false && dia.timeOff.length > 0) {
      for (let i = 0; i < dia.timeOff.length; i++) {
        let to = dia.timeOff[i]
        const auxType = to.type.toLowerCase().trim()
        if (auxType.indexOf('on call sundays') != -1 || auxType.indexOf('on call saturdays') != -1) {
          minutos += this.getMinutesFromHourNumber(to.amount)
        }
      }
    }
    if (diaEl != null && minutos > 0) {
      var auxEl = diaEl.querySelector('.TimesheetSlat__dayTotal')
      var elNote = auxEl.querySelector('.nota')
      if (elNote == null) {
        elNote = document.createElement('span')
        elNote.classList.add('nota')
        elNote.style = `font-size:14px;color:#C2185B;padding-left:6px;`
        auxEl.appendChild(elNote)
      }
      elNote.innerHTML = `Guardia: ${this.timePrint(minutos)}`
    }
    return minutos
  }
  getHoraSalidaHoy(minutosRestantes) {
    let salida = new Date(Date.now() + minutosRestantes * 60000)
    let salidaMinutos = salida.getMinutes()
    let formatoMinutos = salidaMinutos < 10 ? "0" + salidaMinutos : salidaMinutos
    return `${salida.getHours()}:${formatoMinutos}
      <span style="color:gray"> ${salida.getDate()} ${this.meses[salida.getMonth()]}</span>`
  }
  timePrint(minutos) {
    let signo = Math.sign(minutos) >= 0 ? '' : '-'
    let horas = Math.abs(Math.trunc(minutos / 60))
    let mins = Math.abs(minutos % 60)
    return `${signo}${horas}h ${mins}m`
  }
  timePrintNegative(minutos) {
    let stl = `color:#e53935;`
    let res = this.timePrint(minutos)
    if (minutos < 0) {
      return `<i style="${stl}">${res}</i>`
    } else {
      return res
    }
  }
  calcMinutosTrabajo(dias, mediosDias) {
    return (dias * (this.getMinutosJornada())) + (mediosDias * 4 * 60)
  }
  parseTimeText(el) {
    let textTime = el.querySelector('.TimesheetSlat__dayTotal').innerText
    let parsedHours = parseInt(textTime.split('h')[0])
    let parsedMinutes = parseInt(textTime.split(' ')[1].split('m')[0])
    return { hours: parsedHours, minutes: parsedMinutes }
  }

  calcularMinutosATrabajar(els) {
    var minutosTrabajados = 0;
    var diasATrabajar = 0
    var diasOtros = 0
    var mediosDiasATrabajar = 0
    var minutosMedicalAppointments = 0
    var minutosGuardia = 0


    for (var i = 0; i < els.length; i++) {
      let el = els[i]
      const dayName = el.querySelector('.TimesheetSlat__dayOfWeek').innerText.toLowerCase()
      const dayDate = el.querySelector('.TimesheetSlat__dayDate').innerText.toLowerCase()

      let dia = this.getDayFromEl(el)
      // console.log(dia)
      minutosGuardia += this.getMinutosGuardiaFromDia(dia, el)

      /* Trabajados */
      let parsed_a = this.parseTimeText(el)
      minutosTrabajados += parsed_a.hours * 60
      minutosTrabajados += parsed_a.minutes

      /* A trabajar */
      let extra = el.querySelector('.TimesheetSlat__extraInfoItem--clockPush')

      if (dayName != "sat" && dayName != "sun" && dayName != "sáb" && dayName != "dom") {
        if (dia.holidays.length > 0) {
          diasOtros++
        } else if (dia.timeOff.length > 0) {
          if (dia.timeOffHours == 4) {
            diasOtros += 0.5
            mediosDiasATrabajar += 1
          } else {
            diasOtros++
          }
        } else if (extra != null && extra.innerText.indexOf('hours Medical Appointments') != -1) {
          let parsed = this.parseTimeText(el)
          minutosMedicalAppointments += parsed.hours * 60
          minutosMedicalAppointments += parsed.minutes
        } else {
          diasATrabajar++
        }
        //
        //
        // let extra = el.querySelector('.TimesheetSlat__extraInfoItem--clockPush')
        // if (extra == null) {
        //     diasATrabajar++
        // } else {
        //     if (extra.innerText.indexOf('0.5 days Holidays') != -1
        //         || extra.innerText.indexOf('0.5 days Additional Days Off') != -1) {
        //         diasOtros += 0.5
        //         mediosDiasATrabajar += 1
        //     } else if (extra.innerText.indexOf('hours Medical Appointments') != -1) {
        //         let parsed = this.parseTimeText(el)
        //         minutosMedicalAppointments += parsed.hours * 60
        //         minutosMedicalAppointments += parsed.minutes
        //     } else {
        //         diasOtros++
        //     }
        //     // Private Leave
        //     // Compensation:
        //     // Holydays
        //     // Business Trips
        // }
      }
    }
    var minutosATrabajar = this.calcMinutosTrabajo(diasATrabajar, mediosDiasATrabajar)
    minutosATrabajar += minutosMedicalAppointments

    return {
      minutosATrabajar: minutosATrabajar,
      minutosTrabajados: minutosTrabajados,
      diasOtros: diasOtros,
      diasATrabajar: diasATrabajar,
      mediosDiasATrabajar: mediosDiasATrabajar,
      minutosGuardia: minutosGuardia,
      minTrabajadosMenosGuardias: minutosTrabajados - minutosGuardia
    }
  }
  getWeeks() {
    var weeks = []
    var weekNum = 0
    for (var i = 0; i < this.diasMesConFinde.length; i++) {
      let el = this.diasMesConFinde[i]
      const dayName = el.querySelector('.TimesheetSlat__dayOfWeek').innerText
      const dayDate = el.querySelector('.TimesheetSlat__dayDate').innerText

      if (weeks[weekNum] == null) {
        weeks[weekNum] = []
      }
      if (dayName == "Mon") {
        if (weeks[weekNum].length == 0) {
          weeks[weekNum].push(el)
        } else {
          weekNum += 1
          weeks[weekNum] = []
          weeks[weekNum].push(el)
        }
      } else {
        weeks[weekNum].push(el)
      }
    }
    return weeks
  }
  pinta(mensaje) {
    const ks = `display:inline-block;color:#666;font-size:14px;`
    const vs = `display:inline-block;`
    const vs1 = `${vs}width:26px;color:#BA68C8;font-size:16px;`
    const vs2 = `${vs}color:#4CAF50;font-size:16px`
    const vs3 = `${vs}width:26px;color:#EC407A;font-size:16px`
    const vs4 = `${vs}color:#039BE5;font-size:16px`
    const vs5 = `${vs}color:#FF6F00;font-size:16px`
    const vs6 = `${vs}color:#888;font-size:16px`
    const vs7 = `${vs}color:#4CAF50;font-size:18px`
    const vs8 = `${vs}color:#00ACC1;font-size:16px`
    const vs9 = `${vs}color:#C2185B;font-size:16px`
    const vs10 = `${vs}color:#BA68C8;font-size:16px`
    const vs11 = `${vs}color:#ff0000;font-size:16px`

    var aux1 = document.querySelector('.TimesheetEntries')
    var diasMesConFinde = aux1.querySelectorAll('.TimesheetSlat:not(.TimesheetSlat--disabled)')
    // var diasMesSinFinde = aux1.querySelectorAll('.TimesheetSlat:not(.TimesheetSlat--disabled):not(.js-timesheet-showWeekends)')
    // var weeks = this.getWeeks()
    var hoyEl = aux1.querySelector('.TimesheetSlat--today')

    var diasHastaHoy = []
    for (var i = 0; i < diasMesConFinde.length; i++) {
      let el = diasMesConFinde[i]
      diasHastaHoy.push(el)
      if (el == hoyEl) {
        break
      }
    }

    var mes = this.calcularMinutosATrabajar(diasMesConFinde)
    this.setMonthHistory(mes)

    var hastaHoy = this.calcularMinutosATrabajar(diasHastaHoy)


    var parsedHoy
    if (hoyEl) {
      parsedHoy = this.parseTimeText(hoyEl)
    }


    /* DIV */
    // var siblingEl = document.querySelector('.TimesheetSummary__photo')
    var siblingEl = document.querySelector('.Employee__contactInfoContainer')
    var div = document.querySelector('#infoextra')
    if (!div) {
      div = document.createElement('div')
      div.style.padding = '0 0 10px 0'
      div.style.margin = '0 0 10px 0'
      div.style.textAlign = 'left'
      div.style.backgroundColor = '#f6f6f6'
      div.style.borderBottom = '1px solid lightgray'
      div.id = 'infoextra'

      let closeCont = document.createElement('div')
      closeCont.style = 'display:flex;align-items:center;justify-content:flex-end'
      let close = document.createElement('div')
      close.style = `font-family:Times New Roman;font-style:italic;font-weight:bold;
                  background-color:#fafafa;
                  cursor:pointer;padding:2px 7px 3px 7px;line-height:15px;border:1px solid #ddd;`
      close.innerHTML = 'Ocultar'
      closeCont.appendChild(close)

      close.addEventListener('click', e => {
        if (div.style.display == 'none') {
          div.style.display = ''
          close.innerHTML = 'Ocultar'
        } else {
          div.style.display = 'none'
          close.innerHTML = 'Mostrar'
        }
      })
      siblingEl.parentNode.insertBefore(div, siblingEl)
      siblingEl.parentNode.insertBefore(closeCont, div)
    }


    /* HTML */
    var hoyHTML = ``
    if (parsedHoy != null) {
      hoyHTML = `
              <span style="${ks}">Hoy: </span>
              <span style="${vs7}">${parsedHoy.hours}h ${parsedHoy.minutes}m</span>
              ${((parsedHoy.hours * 60) + parsedHoy.minutes >= this.getMinutosJornada()) ? `<br><span style="${vs6}">${mensaje}</span>` : ''}
              <div style="height:1px;background-color:lightgray;margin:10px 0"></div>
      `
    }

    var guardiasHastaHoyHTML = ``
    if (hastaHoy.minutosGuardia > 0) {
      guardiasHastaHoyHTML = `
  <br>
              <span style="${ks}">Guardias: </span>
              <span style="${vs9}">${this.timePrint(hastaHoy.minutosGuardia)}</span>
      `
    }
    var guardiasMesHTML = ``
    if (mes.minutosGuardia > 0) {
      guardiasMesHTML = `
              <span style="${ks}">Guardias: </span>
              <span style="${vs9}">${this.timePrint(mes.minutosGuardia)}</span>
      `
    }


    let year = this.getYearHistory()
    var guardiasAñoHTML = (year.minutosGuardia > 0) ?
      `<span style="${ks}">Guardias: </span>
     <span style="${vs9}">${this.timePrint(year.minutosGuardia)}</span>
    ` : ``

    div.innerHTML = `
          ${hoyHTML}

          <span style="${ks}">Hasta hoy</span>
          <br>
          <span style="${vs10};">día ${hastaHoy.diasATrabajar} de ${mes.diasATrabajar}</span>
          <br>
          <span style="${vs2}">${this.timePrint(hastaHoy.minTrabajadosMenosGuardias)}</span>
          <span style="${ks}">&nbsp; de &nbsp;</span>
          <span style="${vs4}">${this.timePrint(hastaHoy.minutosATrabajar)}</span>
          <br>
          <span style="${ks}"> Restante hoy: </span>
          <span style="${vs5}">${this.timePrintNegative(hastaHoy.minutosATrabajar - hastaHoy.minTrabajadosMenosGuardias)}</span>
          ${guardiasHastaHoyHTML}
          <span style="${ks}"> Hora de salida: </span>
          <span style="${vs8}">${this.getHoraSalidaHoy(hastaHoy.minutosATrabajar - hastaHoy.minTrabajadosMenosGuardias)}</span>

          <div style="height:1px;background-color:lightgray;margin:10px 0"></div>

          <span style="${ks}">Este mes</span>
          <br>
          <span style="${vs2}">${this.timePrint(mes.minTrabajadosMenosGuardias)}</span>
          <span style="${ks}">&nbsp; de &nbsp;</span>
          <span style="${vs4}">${this.timePrint(mes.minutosATrabajar)}</span>
          <br>
          <span style="${ks}">Restante este mes:</span>
          <span style="${vs5}">${this.timePrintNegative(mes.minutosATrabajar - mes.minTrabajadosMenosGuardias)}</span>
          ${guardiasMesHTML}

          <span style="${vs1}">${mes.diasATrabajar + mes.mediosDiasATrabajar / 2}</span>
          &nbsp;
          <span style="${ks}">D&iacute;as de trabajo</span>
          <br>
          <span style="${vs3}">${mes.diasOtros}</span>
          &nbsp;
          <span style="${ks}">Otros d&iacute;as</span>


          <div style="height:1px;background-color:lightgray;margin:10px 0"></div>

          <span style="${ks}">Este año  <i> *beta</i></span>
          <br>
          ${year.months.map(m => `
            <span style="${m.horas == 'sin cargar' ? vs11 : ks};width:2.5em;">${m.nombre}:</span>
            <span style="${m.horas == '0h 0m' ? ks : m.horas == 'sin cargar' ? ks : vs5}">${m.horas}</span><br>
          `).join(' ')}
          <br>
          <span style="${vs2}">${this.timePrint(year.minTrabajadosMenosGuardias)}</span>
          <span style="${ks}"> de </span>
          <span style="${vs4}">${this.timePrint(year.minutosATrabajar)}</span>
          <br>
          <span style="${ks}">Restante este año:</span>
          <span style="${vs5}">${this.timePrintNegative(year.minutosATrabajar - year.minTrabajadosMenosGuardias)}</span>
          ${guardiasAñoHTML}
          `
  }
  setMonthHistory(mes) {
    const key = `historial-${this.timesheetInfo.id}-${this.timesheetInfo.start}`
    localStorage.setItem(key, JSON.stringify(mes))
  }
  getYearHistory() {
    const year = {
      minutosATrabajar: 0,
      minTrabajadosMenosGuardias: 0,
      minutosGuardia: 0,
      months: []
    }
    for (let i = 0; i < this.allTimeSheets.length; i++) {
      const ts = this.allTimeSheets[i]
      const key = `historial-${ts.id}-${ts.start}`
      const mes = JSON.parse(localStorage.getItem(key))
      const date = new Date(ts.start)
      const nombreMes = this.meses[date.getMonth()]

      if (mes != null) {
        const horasRestantes = this.timePrintNegative(mes.minutosATrabajar - mes.minTrabajadosMenosGuardias)
        year.months.push({ nombre: nombreMes, horas: horasRestantes })

        year.minutosGuardia += mes.minutosGuardia
        year.minutosATrabajar += mes.minutosATrabajar
        year.minTrabajadosMenosGuardias += mes.minTrabajadosMenosGuardias
      } else {
        year.months.push({ nombre: nombreMes, horas: 'sin cargar' })
      }
    }
    return year
  }
  getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
  }
}
new Bamboonomix()
