
/**
 * Utility to generate PIX Copy and Paste (EMV QRCPS Merchant Presented Mode)
 * Based on BACEN standard.
 */

function crc16ccitt(payload: string): string {
    let crc = 0xFFFF;
    for (let i = 0; i < payload.length; i++) {
        let c = payload.charCodeAt(i);
        crc ^= (c << 8);
        for (let j = 0; j < 8; j++) {
            if (crc & 0x8000) {
                crc = (crc << 1) ^ 0x1021;
            } else {
                crc = (crc << 1);
            }
        }
    }
    return (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
}

function formatField(id: string, value: string): string {
    const len = value.length.toString().padStart(2, '0');
    return `${id}${len}${value}`;
}

export function generatePixPayload({
    key,
    name,
    city,
    amount,
    txtId = '***'
}: {
    key: string;
    name: string;
    city: string;
    amount?: number;
    txtId?: string;
}): string {
    const amountStr = amount ? amount.toFixed(2) : '0.00';

    // 00 - Payload Format Indicator
    const payloadFormat = formatField('00', '01');

    // 26 - Merchant Account Information
    // 00 - GUI (Global Unique Identifier) -> br.gov.bcb.pix
    // 01 - Key
    const merchantAccount = formatField('26',
        formatField('00', 'br.gov.bcb.pix') +
        formatField('01', key)
    );

    // 52 - Merchant Category Code (0000 - General)
    const mcc = formatField('52', '0000');

    // 53 - Transaction Currency (986 - BRL)
    const currency = formatField('53', '986');

    // 54 - Transaction Amount (Optional, but included here)
    const transactionAmount = amount ? formatField('54', amountStr) : '';

    // 58 - Country Code (BR)
    const countryCode = formatField('58', 'BR');

    // 59 - Merchant Name
    const merchantName = formatField('59', name);

    // 60 - Merchant City
    const merchantCity = formatField('60', city);

    // 62 - Additional Data Field Template
    // 05 - Reference Label (TxId)
    const additionalData = formatField('62', formatField('05', txtId));

    // Base Payload without CRC
    const payload = `${payloadFormat}${merchantAccount}${mcc}${currency}${transactionAmount}${countryCode}${merchantName}${merchantCity}${additionalData}6304`;

    // Calculate CRC
    const crc = crc16ccitt(payload);

    return `${payload}${crc}`;
}
