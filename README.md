# domaincheck

Lookup nameserver, website, and MX information about any number of domains.

Create a file named `domains.txt` and run `npm start`.

Domain information is output to `domains.csv` containing:

1. domain
1. nameserver (converted to a company where possible)
1. website
1. MX record (converted to a company where possible)
1. SPF record
1. "DKIM" if a DKIM record is available
1. DMARC record
