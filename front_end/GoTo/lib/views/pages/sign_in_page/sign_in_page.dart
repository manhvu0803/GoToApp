import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_to/configs/constants/color_constants.dart';
import 'package:go_to/configs/constants/dimen_constants.dart';
import 'package:go_to/configs/constants/enums/auth_enums.dart';
import 'package:go_to/configs/constants/route_constants.dart';
import 'package:go_to/configs/constants/string_constants.dart';
import 'package:go_to/generated/flutter_gen/assets.gen.dart';
import 'package:go_to/utilities/helpers/ui_helper.dart';
import 'package:go_to/views/pages/sign_in_page/bloc/sign_in_cubit.dart';
import 'package:go_to/views/widgets/input_fields/auth_input_field/auth_input_field.dart';
import 'package:go_to/views/widgets/buttons/rounded_rectangle_ink_well_button.dart';

class SignInPage extends StatelessWidget {
  const SignInPage({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (context) => SignInCubit(),
      child: const SignInPageView(),
    );
  }
}

class SignInPageView extends StatefulWidget {
  const SignInPageView({Key? key}) : super(key: key);

  @override
  State<SignInPageView> createState() => _SignInPageViewState();
}

class _SignInPageViewState extends State<SignInPageView> {
  final phoneInputController = TextEditingController();
  final passwordInputController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<SignInCubit, SignInState>(
      builder: (contextSignIn, state) {
        return SafeArea(
          child: Scaffold(
            resizeToAvoidBottomInset: false,
            body: GestureDetector(
              onTap: () {
                UIHelper.hideKeyboard(context);
              },
              child: Container(
                width: double.infinity, height: double.infinity,
                padding: EdgeInsets.only(
                  left: DimenConstants.getProportionalScreenWidth(context, 17),
                  right: DimenConstants.getProportionalScreenWidth(context, 17),
                  bottom: MediaQuery.of(context).viewInsets.bottom,
                ),
                decoration: BoxDecoration(
                  image: DecorationImage(
                    image: AssetImage(Assets.images.signInBackground.signInBackground.path),
                    fit: BoxFit.cover,
                  ),
                ),
                child: SingleChildScrollView(
                  child: ConstrainedBox(
                    constraints: BoxConstraints(
                      maxHeight: DimenConstants.getScreenHeight(context) * 0.7,
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        SizedBox(
                          height: DimenConstants.getProportionalScreenHeight(context, 100),
                        ),

                        //input field
                        AuthInputField(
                          phoneInputController: phoneInputController,
                          passwordInputController: passwordInputController,
                        ),
                        SizedBox(
                          height: DimenConstants.getProportionalScreenHeight(context, 10),
                        ),

                        //forgot password button
                        buildTextButton(context, () {
                          UIHelper.hideKeyboard(context);
                          print("Go to forgot password page.");
                        }, false,),

                        //sign in button
                        RoundedRectangleInkWellButton(
                          width: DimenConstants.getScreenWidth(context),
                          height: DimenConstants.getProportionalScreenHeight(context, 60),
                          paddingVertical: DimenConstants.getProportionalScreenHeight(context, 10),
                          bgLinearGradient: LinearGradient(colors: ColorConstants.defaultOrangeList),
                          onTap: () {
                            UIHelper.hideKeyboard(context);
                            contextSignIn.read<SignInCubit>().onSignInSubmit(
                              phoneInputController.text, passwordInputController.text,
                            );
                          },
                          child: state.authEnum == AuthEnum.authenticating
                              ? const CircularProgressIndicator(color: ColorConstants.baseWhite,)
                              : Text(
                            StringConstants.signIn,
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: DimenConstants.getProportionalScreenWidth(context, 25),
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),

                        //sign up button
                        Align(
                          child: buildTextButton(context, () {
                            UIHelper.hideKeyboard(context);
                            Navigator.pushNamed(context, RouteConstants.signUpRoute);
                          }, true,),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ),
        );
      },
    );
  }

  Widget buildTextButton(
      BuildContext context, Function() onPressed,
      bool isSignUpBtn,
  ) {
    return TextButton(
      onPressed: onPressed,
      style: TextButton.styleFrom(
        padding: EdgeInsets.zero,
        primary: ColorConstants.orange,
      ),
      child: Text(
        isSignUpBtn
            ? "${StringConstants.signUp} ${StringConstants.guestAccount.toLowerCase()}"
            : StringConstants.forgotPassword,
        style: TextStyle(
          fontSize: isSignUpBtn
              ? DimenConstants.getProportionalScreenWidth(context, 17)
              : DimenConstants.getProportionalScreenWidth(context, 15),
          fontWeight: isSignUpBtn ? FontWeight.w500 : FontWeight.w400,
          decoration: isSignUpBtn ? TextDecoration.none : TextDecoration.underline,
        ),
      ),
    );
  }

  @override
  void dispose() {
    phoneInputController.dispose();
    passwordInputController.dispose();
    super.dispose();
  }
}
