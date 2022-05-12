import * as React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// import { DataGrid } from '@material-ui/data-grid';
// import { randomCreatedDate, randomTraderName, randomUpdatedDate } from '@mui/x-data-grid-generator';
// import { randomCreatedDate, randomTraderName, randomUpdatedDate } from '@mui/x-data-grid-generator';

import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import InputAdornment from '@mui/material/InputAdornment';
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';

import {
  ER_PATTERN,
  DPS_TABLE_COLUMN_META,
  FETCH_TABLE_HEADER,
  packHeader,
  createNoteTableHeader,
  DPS_TABLE_HIDDEN_COLUMN,
  DPS_INTERNAL_TABLE_HIDDEN_COLUMN,
  DPS_ROW_COLOR,
  EMPTY_ALERT,
  CHECKED_ALERT,
  OVERWRITE_ALERT,
  DPS_REPORT_PREFIX,
  DPS_BASIC_PATH,
  EXCLUDED_LABEL,
  gvMaps,
  icsiMaps,
  hatchingMaps,
  getConfirmCode,
  packNoteTableHeader,
  DPS_INTERNAL_TABLE_ROW_NUM,
} from '../../lib/utils';
import { RGBColor } from '../../lib/rgbcolor';
import notify from '../../lib/notify';

function isPositiveNumber(num) {
  if (num > 16) {
    return true;
  }
  return false;
}

const StyledBox = styled(Box)(({ theme }) => ({
  width: '100%',
  maxHeight: '100%',
  '& .MuiDataGrid-cell--editing': {
    backgroundColor: 'rgb(255,215,115, 0.19)',
    color: '#1a3e72',
    '& .MuiInputBase-root': {
      height: '100%',
    },
  },
  '& .Mui-error': {
    backgroundColor: `rgb(126,10,15, ${theme.palette.mode === 'dark' ? 0 : 0.1})`,
    color: theme.palette.error.main,
  },
}));

const columns = DPS_TABLE_COLUMN_META;

function useApiRef() {
  const apiRef = React.useRef(null);
  const _columns = React.useMemo(
    () =>
      columns.concat({
        field: '__Hidden__',
        headerName: '',
        width: 0,
        // hide: true,
        renderCell: (params) => {
          apiRef.current = params.api;
          return null;
        },
      }),
    [columns],
  );

  return { apiRef, columns: _columns };
}

function createTextFieldInstance(v, ...coor) {
  const textField = new jsPDF.AcroForm.TextField();
  textField.Rect = coor;
  textField.value = v;
  return textField;
}

function processRows(mapRows) {
  const body = [];
  const label = [];
  mapRows.forEach((value) => {
    if (value.checked === true) {
      const subList = () => {
        const l = {};
        Object.keys(FETCH_TABLE_HEADER(DPS_TABLE_COLUMN_META, DPS_TABLE_HIDDEN_COLUMN)).forEach(
          (ele) => {
            // l.push(value[ele]);
            if (ele === 'no') {
              l[ele] = body.length + 1;
            } else {
              l[ele] = value[ele];
            }
          },
        );
        return l;
      };
      body.push(subList());
      const n = {};
      if (EXCLUDED_LABEL.indexOf(value.reason) === -1) {
        n.firstName = value.firstName;
        n.lastName = value.lastName;
        label.push(n);
      }
    }
  });
  return [body, label];
}

function encodeGVConsents(reason, gv, icsi, hatching) {
  if (reason.toUpperCase().startsWith(ER_PATTERN) === false) {
    return '';
  }
  const gvCode = gv ? gvMaps[gv] : '9';
  const icsiCode = icsi ? icsiMaps[icsi] : '9';
  const hatchingCode = hatching ? hatchingMaps[hatching] : '9';

  return `${gvCode}${icsiCode}${hatchingCode}`;
}

function processRowsForLabTable(mapRows) {
  const body = [];
  mapRows.forEach((value) => {
    const subList = () => {
      const l = {};
      Object.keys(
        FETCH_TABLE_HEADER(DPS_TABLE_COLUMN_META, DPS_INTERNAL_TABLE_HIDDEN_COLUMN),
      ).forEach((ele) => {
        if (ele === 'no') {
          l[ele] = body.length + 1;
        } else if (ele === 'gvConsent') {
          l[ele] = encodeGVConsents(value.reason, value[ele], value.icsi, value.hatching);
        } else {
          l[ele] = value[ele];
        }
      });
      return l;
    };
    body.push(subList());
  });
  return body;
}

function processRowsForNoteTable(mapRows) {
  const body = [];
  mapRows.forEach((value) => {
    if (value.checked === true && value.reason.startsWith(ER_PATTERN) === true) {
      const subList = () => {
        const fullName = `${value.lastName}, ${value.firstName} `;
        const consentCodes = encodeGVConsents(
          value.reason,
          value.gvConsent,
          value.icsi,
          value.hatching,
        );
        const confirmCode = getConfirmCode(consentCodes);
        const l = [
          body.length + 1,
          fullName,
          '',
          '',
          '',
          '',
          confirmCode,
          '',
          '',
          '',
          '',
          '',
          '',
          consentCodes,
        ];
        return l;
      };
      body.push(subList());
    }
  });
  const contentLength = body.length;
  if (contentLength < DPS_INTERNAL_TABLE_ROW_NUM) {
    for (let i = 0; i < DPS_INTERNAL_TABLE_ROW_NUM - contentLength; i += 1) {
      body.push([i + contentLength + 1, '', '', '', '', '', '', '', '', '', '', '']);
    }
  }
  return body;
}

function defineColorForRows(body) {
  const maps = new Map();
  body.forEach((ele) => {
    const rdbColorObj = new RGBColor(DPS_ROW_COLOR[ele.reason]);
    if (rdbColorObj.ok) {
      maps.set(ele.no, [rdbColorObj.r, rdbColorObj.g, rdbColorObj.b]);
    }
  });
  return maps;
}

function getCheckedCount(mapRows) {
  let count = 0;
  mapRows.forEach((value) => {
    if (value.checked === true) {
      count += 1;
    }
  });
  return count;
}

export default function Table({ queryDate, data, loading, error, loadDataFromDB }) {
  // console.log([data.type, data.data]);
  if (queryDate === '') {
    return null;
  }

  // if (loading === true) {
  //   return <div>Loading</div>;
  // }
  if (error) {
    return <div style={{ color: 'red' }}>ERROR: {error}</div>;
  }

  const DPS_FILE_NAME = `${DPS_REPORT_PREFIX}-${queryDate}.pdf`;
  const DPS_FILE_FULL_PATH = `${DPS_BASIC_PATH}${DPS_FILE_NAME}`;

  const [MD, setMD] = React.useState('');
  const [PRE, setPRE] = React.useState('');
  const [POST, setPOST] = React.useState('');
  const [MA, setMA] = React.useState('');
  const [alert, setAlert] = React.useState('');
  const [checkedCount, setCheckedCount] = React.useState(0);
  const { apiRef, columns } = useApiRef();

  React.useEffect(() => {
    loadDataFromDB(queryDate);
  }, []);

  // const handleClickButton = () => {
  //   console.log(apiRef.current.getRowModels());
  // };
  // console.log(data);

  const printDPS = () => {
    const doc = new jsPDF('l');
    // console.log(processRows(apiRef.current.getRowModels()));
    // console.log(packHeader());
    const [dataPDF, labelPDF] = processRows(apiRef.current.getRowModels());
    // console.log(dataPDF);
    const dataInternalTablePDF = processRowsForLabTable(apiRef.current.getRowModels());
    // console.log(dataInternalTablePDF);
    const dataNoteTablePDF = processRowsForNoteTable(apiRef.current.getRowModels());
    // console.log(dataNoteTablePDF);
    const colorMaps = defineColorForRows(dataPDF);

    if (dataPDF.length > 0) {
      doc.setFontSize(14);
      doc.text('MD:', 30, 10);
      // doc.addField(createTextFieldInstance(`DR. ${MD.toUpperCase()}`, 48, 4, 30, 8));
      doc.text(`DR. ${MD.toUpperCase()}`, 48, 10);

      doc.text('PRE:', 30, 20);
      // doc.addField(createTextFieldInstance(PRE.toUpperCase(), 48, 14, 30, 8));
      doc.text(PRE.toUpperCase(), 48, 20);

      doc.text('POST:', 30, 30);
      // doc.addField(createTextFieldInstance(POST.toUpperCase(), 48, 24, 30, 8));
      doc.text(POST.toUpperCase(), 48, 30);

      doc.text('MA:', 30, 40);
      // doc.addField(createTextFieldInstance(MA.toUpperCase(), 48, 34, 30, 8));
      doc.text(MA.toUpperCase(), 48, 40);

      doc.setFontSize(18);
      doc.text('DAILY PROCEDURE SCHEDULE', 100, 10);
      doc.setFontSize(14);
      doc.text('NEW HOPE FERTILITY CENTER', 110, 20);
      doc.text(queryDate, 140, 30);
      doc.text(`TOTALS: ${dataPDF.length}`, 140, 40);

      doc.autoTable({
        head: [Object.values(FETCH_TABLE_HEADER(DPS_TABLE_COLUMN_META, DPS_TABLE_HIDDEN_COLUMN))],
        headStyles: {
          fillColor: [200, 200, 200],
          fontStyle: 'bold',
          textColor: 0,
          fontSize: 8,
          lineColor: [0, 0, 0],
          halign: 'center',
        },
        body: dataPDF,
        bodyStyles: { fontSize: 6, textColor: 0 },
        columns: packHeader(DPS_TABLE_COLUMN_META, DPS_TABLE_HIDDEN_COLUMN),
        startY: 50,
        startX: 5,
        allSectionHooks: true,
        didParseCell(data) {
          if (colorMaps.has(data.row.index + 1) === true && data.section === 'body') {
            data.cell.styles.fillColor = colorMaps.get(data.row.index + 1);
          }
        },
        theme: 'grid',
        columnStyles: { text: { cellWidth: 'wrap' } },
      });

      doc.addPage('a4', 'portrait');
      // doc.setPage(2);
      doc.setFontSize(20);
      doc.text('FOR EMBRYOLOGY LAB ONLY', 10, 10);
      doc.setFontSize(24);
      doc.text('LABEL', 10, 20);
      doc.autoTable({
        head: [['First Name', 'Last Name']],
        headStyles: {
          fillColor: [200, 200, 200],
          fontStyle: 'bold',
          textColor: 0,
          fontSize: 20,
          lineColor: [0, 0, 0],
          halign: 'center',
        },
        body: labelPDF,
        bodyStyles: { fontSize: 20, fontStyle: 'bold', cellWidth: 'auto', textColor: 0 },
        columns: [
          { header: 'First Name', dataKey: 'firstName' },
          { header: 'Last Name', dataKey: 'lastName' },
        ],
        startY: 30,
        startX: 5,
        theme: 'striped',
      });
    }

    if (dataPDF.length > 0) {
      doc.addPage('a4', 'landscape');
    }
    doc.setFontSize(10);
    doc.text('FOR EMBRYOLOGY LAB ONLY', 10, 5);
    doc.setFontSize(10);
    doc.text('MD:', 30, 10);
    // doc.addField(createTextFieldInstance(`DR. ${MD.toUpperCase()}`, 48, 4, 30, 8));
    doc.text(`DR. ${MD.toUpperCase()}`, 48, 10);

    doc.text('PRE:', 30, 15);
    // doc.addField(createTextFieldInstance(PRE.toUpperCase(), 48, 14, 30, 8));
    doc.text(PRE.toUpperCase(), 48, 15);

    doc.text('POST:', 30, 20);
    // doc.addField(createTextFieldInstance(POST.toUpperCase(), 48, 24, 30, 8));
    doc.text(POST.toUpperCase(), 48, 20);

    doc.text('MA:', 30, 25);
    // doc.addField(createTextFieldInstance(MA.toUpperCase(), 48, 34, 30, 8));
    doc.text(MA.toUpperCase(), 48, 25);

    doc.setFontSize(10);
    doc.text('DAILY PROCEDURE SCHEDULE', 100, 10);
    doc.setFontSize(10);
    doc.text('NEW HOPE FERTILITY CENTER', 100, 15);
    doc.text(queryDate, 120, 20);
    doc.text(`TOTALS: ${dataInternalTablePDF.length}`, 120, 25);

    doc.autoTable({
      head: [
        Object.values(FETCH_TABLE_HEADER(DPS_TABLE_COLUMN_META, DPS_INTERNAL_TABLE_HIDDEN_COLUMN)),
      ],
      headStyles: {
        fillColor: [255, 255, 255],
        fontStyle: 'bold',
        textColor: 0,
        fontSize: 8,
        lineColor: [200, 200, 200],
        halign: 'center',
        lineWidth: 0.1,
      },
      body: dataInternalTablePDF,
      bodyStyles: { fontSize: 6, textColor: 0 },
      columns: packHeader(DPS_TABLE_COLUMN_META, DPS_INTERNAL_TABLE_HIDDEN_COLUMN),
      startY: 30,
      startX: 5,
      allSectionHooks: true,
      theme: 'grid',
      columnStyles: { text: { cellWidth: 'wrap' } },
      margin: 1,
    });

    if (dataPDF.length > 0) {
      doc.addPage('a4', 'landscape');
      doc.setFontSize(20);
      doc.text('FOR EMBRYOLOGY LAB ONLY', 10, 10);

      doc.setFontSize(18);
      doc.text(`DAILY PROCEDURE CONSENT NOTE on ${queryDate}`, 60, 20);

      doc.autoTable({
        head: createNoteTableHeader(),
        headStyles: {
          fillColor: [255, 255, 255],
          fontStyle: 'bold',
          textColor: 0,
          fontSize: 8,
          lineColor: [200, 200, 200],
          halign: 'center',
          lineWidth: 0.1,
        },
        body: dataNoteTablePDF,
        bodyStyles: { fontSize: 10, textColor: 0 },
        startY: 25,
        startX: 5,
        margin: 1,
        theme: 'striped',
      });
    }

    doc.setProperties({
      title: DPS_FILE_NAME,
      subject: DPS_FILE_NAME,
      author: 'Jia Wang',
      keywords: 'DPS flow implemented by Jia Wang',
      creator: 'nhfc-mgmt',
    });

    // doc.save(DPS_FILE_NAME);
    // const string = doc.output('datauristring', { filename: DPS_FILE_NAME });
    // const embed = `<embed width='100%' height='100%' src='${string}'/>`;
    // const x = window.open();
    // x.document.open();
    // x.document.write(embed);
    // x.document.close();
    // const blobPDF = new Blob([doc.output('blob', { filename: DPS_FILE_NAME })], {
    //   type: 'application/pdf',
    // });
    const url = URL.createObjectURL(doc.output('blob', { filename: DPS_FILE_NAME }));
    window.open(url);
    // URL.revokeObjectURL(url);
    // showData(URL.createObjectURL(doc.output('blob')), DPS_FILE_NAME);
  };

  const handleNo = () => {
    setAlert('');
  };

  const handleYes = () => {
    printDPS();
    // notify(`${DPS_FILE_NAME} has been saved to ${DPS_BASIC_PATH}`);
    setAlert('');
  };

  const handleClickOpen = () => {
    if (!MD) {
      notify('MD is required');
      return;
    }
    if (!PRE) {
      notify('PRE is required');
      return;
    }
    if (!POST) {
      notify('POST is required');
      return;
    }
    if (!MA) {
      notify('MA is required');
      return;
    }

    // Firstly pop up checked rows alert.
    const checkedCountAfterSubmit = getCheckedCount(apiRef.current.getRowModels());
    if (checkedCountAfterSubmit === 0) {
      setAlert(EMPTY_ALERT);
    } else if (checkedCountAfterSubmit < data.length) {
      setAlert(CHECKED_ALERT);
      // renderConfirmDialog();
    } else {
      printDPS();
    }
  };

  const handleClose = () => {
    setAlert('');
  };

  // const rows = loadDataFromDB(queryDate);
  // setData(rows);
  // console.log(rows);
  // const rows = await getDthis.props.queryDatePSDataApiMethod({ queryDate });
  return (
    <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
      <div id="divToPrint">
        <Grid container rowSpacing={2} columnSpacing={{ xs: 8, sm: 2, md: 3 }}>
          <Grid item xs={4}>
            <TextField
              size="small"
              label="MD:"
              id="md"
              sx={{ m: 1, width: '25ch' }}
              InputProps={{
                startAdornment: <InputAdornment position="start">DR. </InputAdornment>,
              }}
              value={MD}
              onChange={(e) => {
                setMD(e.target.value);
              }}
            />
            <br />
            <TextField
              size="small"
              label="PRE:"
              id="pre"
              sx={{ m: 1, width: '25ch' }}
              value={PRE}
              onChange={(e) => {
                setPRE(e.target.value);
              }}
            />
            <br />
            <TextField
              size="small"
              label="POST:"
              id="post"
              sx={{ m: 1, width: '25ch' }}
              value={POST}
              onChange={(e) => {
                setPOST(e.target.value);
              }}
            />
            <br />
            <TextField
              size="small"
              label="MA:"
              id="ma"
              sx={{ m: 1, width: '25ch' }}
              value={MA}
              onChange={(e) => {
                setMA(e.target.value);
              }}
            />
            <br />
          </Grid>
          <Grid item xs={8}>
            <h1>DAILY PROCEDURE SCHEDULE</h1>
            <h2> On {queryDate}</h2>
            <h2> New Hope Fertility Center</h2>
          </Grid>

          <Grid item xs={12}>
            <StyledBox>
              <DataGrid
                rows={data}
                columns={columns}
                pageSize={25}
                autoHeight
                autoPageSize
                hideFooter
                experimentalFeatures={{ newEditingApi: true }}
                editMode="row"
              />
            </StyledBox>
          </Grid>
        </Grid>
      </div>
      <Grid item xs={12}>
        <Button variant="contained" color="primary" onClick={handleClickOpen}>
          Print Out
        </Button>
        <Dialog maxWidth="xs" open={alert.length > 0} onClose={handleClose}>
          <DialogTitle>Are you sure?</DialogTitle>
          <DialogContent dividers>{`${alert}`}</DialogContent>
          <Button onClick={handleNo}>No</Button>
          <Button onClick={handleYes} autoFocus>
            Yes
          </Button>
        </Dialog>
      </Grid>
      {/* </form> */}
    </Paper>
  );
}

Table.propTypes = {
  queryDate: PropTypes.string.isRequired,
  data: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      no: PropTypes.number.isRequired,
      lastName: PropTypes.string.isRequired,
      firstName: PropTypes.string.isRequired,
      age: PropTypes.number.isRequired,
      reason: PropTypes.string.isRequired,
      time: PropTypes.string.isRequired,
      chart: PropTypes.string.isRequired,
    }),
  ).isRequired,
  loading: PropTypes.bool.isRequired,
  error: PropTypes.string.isRequired,
  loadDataFromDB: PropTypes.func.isRequired,
};
