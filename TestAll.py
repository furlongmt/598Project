
from Naked.toolshed.shell import execute_js
import csv

website_list = []

with open('top500.domains.09.17.csv', 'r') as webfile:
	reader = csv.reader(webfile, delimiter=',')
	next(reader, None) # skip headers
	for row in reader:
		website_list.append("http://" + row[1].rstrip('/'))  # They don't have http for some reason...

for x in range(0, 10):

	success = execute_js('perf-timeline.js', website_list[x])

	if not success:
		print(website_list[x])