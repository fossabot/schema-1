const expect = require('chai').expect

const validate = require('../dist/json-schema/frontend')

const defaultObject = {
  //"DatasetName":"Test",
  "MonitoringLocationID":"A1",
  "MonitoringLocationName":"A1 Test",
  "MonitoringLocationLatitude":"51.0486",
  "MonitoringLocationLongitude":"-114.0708",
  "MonitoringLocationHorizontalCoordinateReferenceSystem":"AMSMA",
  "MonitoringLocationType":"ocean",
  "ActivityType":"Field Msr/Obs",
  "ActivityMediaName":"surface Water",
  "ActivityDepthHeightMeasure":"-34",
  "ActivityDepthHeightUnit":"m",
  "SampleCollectionEquipmentName":"bucket",
  "CharacteristicName":"aluminum",
  "MethodSpeciation":"as B",
  "ResultSampleFraction":"Dissolved",
  "ResultValue":"99.99",
  "ResultUnit":"#/100ml",
  'ResultValueType':'Actual',
  "ResultStatusID":"Accepted",
  "ResultComment":"None at this time",
  "ResultAnalyticalMethodID":"1",
  "ResultAnalyticalMethodContext":"APHA",
  "ActivityStartDate":"2018-02-23",
  "ActivityStartTime":"13:15:00",
  "ActivityEndDate":"2018-02-23",
  "ActivityEndTime":"13:15:00",
  "LaboratoryName":"Farrell Labs",
  "LaboratorySampleID":"101010011110",
  "AnalysisStartDate":"2018-02-23",
  "AnalysisStartTime":"13:15:00",
  "AnalysisStartTimeZone":"-06:00"
}

const checkProperty = (errors, keyword, property) => {
  for (let i = errors.length; i--; i) {
    const error = validate.errors[i]
    if (error.keyword !== keyword) continue
    if (['required', 'dependencies'].includes(keyword) && error.params.missingProperty === property) return true
    else if (keyword === 'additionalProperties' && error.params.additionalProperty === property) return true
    else if (keyword === 'oneOf' && error.params.passingSchemas.includes(property)) return true
    else if (keyword === 'anyOf') return true
    else if (keyword === 'not' && error.dataPath.includes(property)) return true
    else if (keyword === 'enum' && error.dataPath.includes(property)) return true
    else if (keyword === 'minimum' && error.dataPath.includes(property)) return true
    else if (keyword === 'exclusiveMinimum' && error.dataPath.includes(property)) return true
    else if (keyword === 'maximum' && error.dataPath.includes(property)) return true
    else if (keyword === 'exclusiveMaximum' && error.dataPath.includes(property)) return true
  }
  return false
}

describe('Special Logic Cases', function () {

  // #/allOf/6
  it('Should prevent Dissolved oxygen (DO) in %', function (done) {

    // TODO will need custom error message
    const valid = validate({
      'CharacteristicName': 'Dissolved oxygen (DO)',
      'ResultValue': '1',
      'ResultUnit': '%'
    })
    expect(valid).to.equal(false)
    expect(checkProperty(validate.errors, 'enum', 'ResultUnit')).to.equal(true)
    done()
  })

  // #/allOf/7
  it('Dissolved oxygen saturation should >= 0', function (done) {

    const valid = validate(Object.assign({}, defaultObject, {
      'CharacteristicName': 'Dissolved oxygen saturation',
      'ResultValue': '-2',
      'ResultUnit': '%'
    }))
    expect(valid).to.equal(false)
    expect(checkProperty(validate.errors, 'minimum', 'ResultValue')).to.equal(true)
    done()
  })

  // #/allOf/7
  it('Hardness should be >= 0', function (done) {

    const valid = validate({
      'CharacteristicName': 'Hardness',
      'ResultValue': '-1',
      'ResultUnit': 'mg/L'
    })

    expect(valid).to.equal(false)
    expect(checkProperty(validate.errors, 'minimum', 'ResultValue')).to.equal(true)
    done()
  })

  // #/allOf/8
  it('pH should be >= 0', function (done) {

    const valid = validate({
      'CharacteristicName': 'pH',
      'ResultValue': '-1',
      'ResultUnit': 'None'
    })
    expect(valid).to.equal(false)
    expect(checkProperty(validate.errors, 'minimum', 'ResultValue')).to.equal(true)
    done()
  })
  it('pH should be in range (max)', function (done) {

    const valid = validate({
      'CharacteristicName': 'pH',
      'ResultValue': '15',
      'ResultUnit': 'None'
    })
    expect(valid).to.equal(false)
    expect(checkProperty(validate.errors, 'maximum', 'ResultValue')).to.equal(true)
    done()
  })

  // #/allOf/9
  it('Temperature should be in range (min)', function (done) {

    const valid = validate({
      'CharacteristicName': 'Temperature',
      'ResultValue': '-101',
      'ResultUnit': 'deg C'
    })
    expect(valid).to.equal(false)
    expect(checkProperty(validate.errors, 'minimum', 'ResultValue')).to.equal(true)
    done()
  })
  it('Temperature should be in range (max)', function (done) {

    const valid = validate({
      'CharacteristicName': 'Temperature',
      'ResultValue': '101',
      'ResultUnit': 'deg C'
    })
    expect(valid).to.equal(false)
    expect(checkProperty(validate.errors, 'maximum', 'ResultValue')).to.equal(true)
    done()
  })


})
