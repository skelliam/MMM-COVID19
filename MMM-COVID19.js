/* global Module */

/* Magic Mirror
 * Module: MMM-COVID19
 *
 * By Jose Forte
 * MIT Licensed.
 */

Module.register("MMM-COVID19", {
  countriesStats: {},
  globalStats: { "total_cases": "", "total_deaths": "", "total_recovered": "" }, // beautify things at start
  defaults: {
    header: 'COVID-19',    
    countries: [ "Argentina", "Italy", "Spain", "Germany" ], // default list
    worldStats: false,
    rapidapiKey : "", // X-RapidAPI-Key provided at https://rapidapi.com/astsiatsko/api/coronavirus-monitor
    headerRowClass: "small", // small, medium or big
    updateInterval: 300000, // update interval in milliseconds
    fadeSpeed: 4000
  },

  getStyles: function() {
    return ["MMM-COVID19.css"]
  },

  start: function() {
    this.getInfo()
    this.scheduleUpdate()
  },

  scheduleUpdate: function(delay) {
    var nextLoad = this.config.updateInterval
    if (typeof delay !== "undefined" && delay >= 0) {
      nextLoad = delay
    }
    var self = this
    setInterval(function() {
      self.getInfo()
    }, nextLoad)
  },

  getInfo: function () {
    this.sendSocketNotification('GET_BY_COUNTRY_STATS', this.config.rapidapiKey)

    if (this.config.worldStats) {
      this.sendSocketNotification('GET_GLOBAL_STATS', this.config.rapidapiKey)
    }
  },

  socketNotificationReceived: function(notification, payload) {
    var self = this
    if (notification === "BYCOUNTRY_RESULT") {
      this.countriesStats = payload
      this.updateDom(self.config.fadeSpeed)
    }
    if (notification === "GLOBAL_RESULT") {
      this.globalStats = payload
      this.updateDom(self.config.fadeSpeed)
    }
  },

  getHeader: function() {
    return this.config.header
  },

  getDom: function() {
    var countriesList = this.config.countries
    var countriesStats = this.countriesStats["countries_stat"]
    var globalStats = this.globalStats
    
    var wrapper = document.createElement("table")
    wrapper.className = this.config.tableClass || 'covid'

    // header row
    var headerRow = document.createElement("tr"),
        headerconfirmedCell = document.createElement("td"),
        headerCountryNameCell = document.createElement("td"),
        headerrecoveredCell = document.createElement("td"),
        headerdeathsCell = document.createElement("td"),
        headeractiveCell = document.createElement("td")

    headerCountryNameCell.innerHTML = ''
    headerconfirmedCell.className = 'number confirmed ' + this.config.headerRowClass
    headerconfirmedCell.innerHTML = 'Confirmed'
    headerdeathsCell.className = 'number deaths ' + this.config.headerRowClass
    headerdeathsCell.innerHTML = 'Deaths'
    headerrecoveredCell.className = 'number recovered ' + this.config.headerRowClass
    headerrecoveredCell.innerHTML = 'Recovered'
    headeractiveCell.className = 'number active ' + this.config.headerRowClass
    headeractiveCell.innerHTML = 'Active'

    headerRow.appendChild(headerCountryNameCell)
    headerRow.appendChild(headerconfirmedCell)
    headerRow.appendChild(headerdeathsCell)
    headerRow.appendChild(headerrecoveredCell)
    headerRow.appendChild(headeractiveCell)

    wrapper.appendChild(headerRow)
    // WorldWide row, activate it via config
    if (this.config.worldStats) {
      let worldRow = document.createElement("tr"),
          worldNameCell = document.createElement("td"),
          confirmedCell = document.createElement("td"),
          deathsCell = document.createElement("td"),
          recoveredCell = document.createElement("td"),
          activeCell = document.createElement("td"),
          cases = globalStats["total_cases"],
          deaths = globalStats["total_deaths"],
          totalRecovered = globalStats["total_recovered"],
          activeCases = '';

      worldNameCell.innerHTML = 'Worldwide'
      worldRow.className = 'world'
      confirmedCell.className = 'number confirmed'
      confirmedCell.innerHTML = cases
      deathsCell.className = 'number deaths'
      deathsCell.innerHTML = deaths
      recoveredCell.className = 'number recovered'
      recoveredCell.innerHTML = totalRecovered
      activeCell.className = 'number active'
      activeCell.innerHTML = activeCases

      worldRow.appendChild(worldNameCell)
      worldRow.appendChild(confirmedCell)
      worldRow.appendChild(deathsCell)
      worldRow.appendChild(recoveredCell)
      worldRow.appendChild(activeCell)
      
      wrapper.appendChild(worldRow)
    }
    // countries row, one per country listed at config => countries
    for (let key in countriesStats) {
      let value = countriesStats[key]
      if (countriesList.indexOf(value["country_name"]) != -1) {
        let countryRow = document.createElement("tr"),
            countryNameCell = document.createElement("td"),
            confirmedCell = document.createElement("td"),
            deathsCell = document.createElement("td"),
            recoveredCell = document.createElement("td"),
            activeCell = document.createElement("td"),
            countryName = value["country_name"],
            cases = value["cases"],
            deaths = value["deaths"],
            totalRecovered = value["total_recovered"],
            activeCases = value["active_cases"];

        countryNameCell.innerHTML = countryName
        confirmedCell.className = 'number confirmed'
        confirmedCell.innerHTML = cases
        deathsCell.className = 'number deaths'
        deathsCell.innerHTML = deaths
        recoveredCell.className = 'number recovered'
        recoveredCell.innerHTML = totalRecovered
        activeCell.className = 'number active'
        activeCell.innerHTML = activeCases

        countryRow.appendChild(countryNameCell)
        countryRow.appendChild(confirmedCell)
        countryRow.appendChild(deathsCell)
        countryRow.appendChild(recoveredCell)
        countryRow.appendChild(activeCell)
        
        wrapper.appendChild(countryRow)
      }
    }    
		return wrapper
  },

})
