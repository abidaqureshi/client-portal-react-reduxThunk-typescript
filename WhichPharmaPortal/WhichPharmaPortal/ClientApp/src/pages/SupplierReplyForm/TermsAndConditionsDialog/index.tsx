import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@material-ui/core';
import * as React from 'react';
import { useTranslations } from '../../../store/Translations/hooks';
import { TK } from '../../../store/Translations/translationKeys';

const TermsAndConditionsDialog : React.FC<{open: boolean, onClose: () => void}> = ({open, onClose}) => {
    const t = useTranslations();
    return (
        <Dialog open={open} maxWidth="md">
            <DialogTitle>{t(TK.termsAndConditions)}</DialogTitle>
            <DialogContent>
            <ol>
                <li>
                    <Typography>
                        Acceptance the use of RB PHARMA’s RFQ reply form Terms and Conditions
                        RB PRODUTOS FARMACÊUTICOS UNIPESSOAL LDA. (hereinafter referred to as "RB PHARMA") whose registered office is at Rua Leopoldo de Almeida, 11B, 1750-137 Lisbon, Portugal is a commercial company dedicated to storage and wholesale distribution of medical products for human use, pursuant to Decree Law n.º 176/2006, of 30 August, Decree Law n.º 184/97, of 26 July, Administrative Order nº 348/98, of 15 June, and it is the holder of the necessary authorizations, issued by INFARMED – Autoridade Nacional do Medicamento e Produtos de Saúde, I.P..
                        Accordingly, RB PHARMA uses a platform (hereinafter RB PHARMA’s RFQ reply form or the Website) that enable their suppliers to reply directly to the requests for quotation (RFQ) presented. 
                        Your access to and use of RB PHARMA’s RFQ reply form is subject exclusively to these Terms and Conditions. You will not use the Website for any purpose that is unlawful or prohibited by these Terms and Conditions. By using the Website you are fully accepting the terms, conditions and disclaimers contained in this notice. If you do not accept these Terms and Conditions you must immediately stop using the Website.
                    </Typography>
                </li>
                <hr/>
                <li>
                    <Typography>
                        Credit card details
                        RB PHARMA will never ask for Credit Card details and request that you do not enter it on any of the fields on RB PHARMA’s RFQ reply form.
                    </Typography>
                </li>
                <hr/>
                <li>
                    <Typography>
                        Advice
                        The contents of RB PHARMA’s RFQ reply form do not constitute advice and should not be relied upon in making or refraining from making, any decision.
                    </Typography>
                </li>
                <hr/>
                <li>
                    <Typography>
                        Change of Use
                        RB PHARMA reserves the right to:
                    </Typography>
                    <ol>
                        <li>
                            <Typography>
                                change or remove (temporarily or permanently) the Website or any part of it without notice and you confirm that RB PHARMA shall not be liable to you for any such change or removal and.
                            </Typography>
                        </li>
                        <li>
                            <Typography>
                                change these Terms and Conditions at any time, and your continued use of the Website following any changes shall be deemed to be your acceptance of such change.
                            </Typography>
                        </li>
                    </ol>
                </li>
                <hr/>
                <li>
                    <Typography>
                        Links to Third Party Websites
                        RB PHARMA’s RFQ reply form may include links to third party websites that are controlled and maintained by others. Any link to other websites is not an endorsement of such websites and you acknowledge and agree that we are not responsible for the content or availability of any such sites.
                    </Typography>
                </li>
                <hr/>
                <li>
                    <Typography>
                        Copyright
                    </Typography>
                    <ol>
                        <li>
                            <Typography>
                                All copyright, trademarks and all other intellectual property rights in the Website and its content (including without limitation the Website design, text, graphics and all software and source codes connected with the Website) are owned by or licensed to RB PHARMA or otherwise used by RB PHARMA as permitted by law.
                            </Typography>
                        </li>
                        <li>
                            <Typography>
                                In accessing the Website you agree that you will access the content solely for reply to RB PHARMA’s RFQs. None of the content may be downloaded, copied, reproduced, transmitted, stored, sold or distributed without the prior written consent of the copyright holder. 
                            </Typography>
                        </li>
                    </ol>
                </li>
                <hr/>
                <li>
                    <Typography>
                        Disclaimers and Limitation of Liability
                    </Typography>
                    <ol>
                        <li>
                            <Typography>
                                The Website is provided on an AS IS and AS AVAILABLE basis without any representation or endorsement made and without warranty of any kind whether express or implied, including but not limited to the implied warranties of satisfactory quality, fitness for a particular purpose, non-infringement, compatibility, security and accuracy.
                            </Typography>
                        </li>
                        <li>
                            <Typography>
                                To the extent permitted by law, RB PHARMA will not be liable for any indirect or consequential loss or damage whatever (including without limitation loss of business, opportunity, data, profits) arising out of or in connection with the use of the Website.
                            </Typography>
                        </li>
                        <li>
                            <Typography>
                                RB PHARMA makes no warranty that the functionality of the Website will be uninterrupted or error free, that defects will be corrected or that the Website or the server that makes it available are free of viruses or anything else which may be harmful or destructive.
                            </Typography>
                        </li>
                        <li>
                            <Typography>
                                Nothing in these Terms and Conditions shall be construed so as to exclude or limit the liability of RB PHARMA for death or personal injury as a result of the negligence of RB PHARMA or that of its employees or agents.
                            </Typography>
                        </li>
                    </ol>
                </li>
                <hr/>
                <li>
                    <Typography>
                        Indemnity
                        You agree to indemnify and hold RB PHARMA and its employees and agents harmless from and against all liabilities, legal fees, damages, losses, costs and other expenses in relation to any claims or actions brought against RB PHARMA arising out of any breach by you of these Terms and Conditions or other liabilities arising out of your use of this Website.
                    </Typography>
                </li>
                <hr/>
                <li>
                    <Typography>
                        Severance
                        If any of these Terms and Conditions should be determined to be invalid, illegal or unenforceable for any reason by any court of competent jurisdiction then such Term or Condition shall be severed and the remaining Terms and Conditions shall survive and remain in full force and effect and continue to be binding and enforceable.
                    </Typography>
                </li>
                <hr/>
                <li>
                    <Typography>
                        Governing Law
                        These Terms and Conditions shall be governed by and construed in accordance with the law of Portugal and you hereby submit to the exclusive jurisdiction of the Portuguese courts.
                    </Typography>
                </li>
            </ol>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>{t(TK.close)}</Button>
            </DialogActions>
        </Dialog>
    );
}

export default TermsAndConditionsDialog;