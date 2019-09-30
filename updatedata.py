import json
from faker import Faker
import random
from datetime import datetime, timedelta

fake = Faker()

def randfloat(mn, mx):
    return round(mn + random.random() * (mx - mn), 1)

class Patient:
    def __init__(self):
        self.MRN = random.randint(1000000000, 9999999999)
        name = fake.name().split()
        self.FirstName = name[0]
        self.LastName = name[1]
        dob = str(fake.date_between(start_date="-65y", end_date="-2y")).split('-')
        self.DOB = f'{dob[2]}-{dob[1]}-{dob[0]}'
        self.ATS = -1
        self.Registration = datetime.now().replace(microsecond=0) - timedelta(seconds=random.randint(0, 60), minutes=random.randint(5, 60 * 3))
        self.LOC = random.randint(5, 15)

        self.Vitals = {}
        self.gen_vitals()
        if len(self.Vitals) < 1:
            self.Vitals = None

        self.Bloodgas = {}
        self.gen_bloodgasses()
        
        self.Registration = str(self.Registration)

        if self.Vitals:
            for i in range(len(self.Vitals['Body Temperature'])):
                self.Vitals['Body Temperature'][i]['time'] = str(self.Vitals['Body Temperature'][i]['time'])

        if len(self.Bloodgas) < 1:
            self.Bloodgas = None

    def toJSON(self):
        return json.dumps(self, default=lambda o: o.__dict__, 
            sort_keys=True, indent=4)

    def gen_vitals(self):
        n = random.randint(1, 2)
        vital_times = [self.Registration + timedelta(seconds=random.randint(0, 60), minutes=random.randint(5, 60 * 2)) for i in range(n)]
        vital_times = [t for t in vital_times if t <= datetime.now()]
        n = len(vital_times)

        if n < 1:
            return

        self.Vitals['Body Temperature'] = [{'time': vital_times[i], 'value': randfloat(33, 40)} for i in range(n)]
        self.Vitals['Pulse Rate'] = [{'time': str(vital_times[i]), 'value': randfloat(55, 105)} for i in range(n)]
        self.Vitals['Respiration Rate'] = [{'time': str(vital_times[i]), 'value': random.randint(8, 28)} for i in range(n)]
        self.Vitals['Systolic Pressure'] = [{'time': str(vital_times[i]), 'value': random.randint(85, 125)} for i in range(n)]
        self.Vitals['Diastolic Pressure'] = [{'time': str(vital_times[i]), 'value': round(self.Vitals['Systolic Pressure'][i]['value'] / 1.5)} for i in range(n)]
        
    def gen_bloodgasses(self):
        if self.Vitals and len(self.Vitals['Body Temperature']) > 0:
            n = random.randint(1, 2)
            bloodgas_times = [self.Vitals['Body Temperature'][-1]['time'] + timedelta(seconds=random.randint(0, 60), minutes=random.randint(5, 60 * 2)) for i in range(n)]
            bloodgas_times = [str(t) for t in bloodgas_times if t <= datetime.now()]
            n = len(bloodgas_times)

            if n < 1:
                return

            self.Bloodgas['pH'] = [{'time': bloodgas_times[i], 'value': randfloat(7.32, 7.48)} for i in range(n)]
            self.Bloodgas['ppO2'] = [{'time': bloodgas_times[i], 'value': random.randint(70, 110)} for i in range(n)]
            self.Bloodgas['ppCO2'] = [{'time': bloodgas_times[i], 'value': random.randint(35, 45)} for i in range(n)]
            self.Bloodgas['ppHCO3'] = [{'time': bloodgas_times[i], 'value': random.randint(22, 28)} for i in range(n)]
            self.Bloodgas['O2S'] = [{'time': bloodgas_times[i], 'value': random.randint(90, 100)} for i in range(n)]

def serialize(obj):
    if isinstance(obj, datetime):
        serial = obj.isoformat()
        return serial

    return obj.__dict__

def main():
    patients = [serialize(Patient()) for i in range(1000)]
    json.dump(patients, open("dashboard/REST-data.json", "w"))

if __name__ == '__main__':
    main()